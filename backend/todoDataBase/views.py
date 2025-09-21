from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError, APIException
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import User, Task, Shop, Inventory, Rank
from .models import FriendRequest, Friendship, TaskCollaborator
from .serializers import FriendRequestSerializer, FriendshipSerializer, TaskCollaboratorSerializer
from .serializers import (
    UserSerializer, RegisterSerializer, TaskSerializer,
    ItemSerializer, UserItemSerializer, CharacterSerializer,
    CustomTokenObtainPairSerializer, RankSerializer
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {'detail': 'Неверные учетные данные', 'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            
            user = data['user']

            return Response({
                'access': data['access'],
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class CharacterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Inventory.objects.filter(user=self.request.user, is_purchased=True)

    @action(detail=False, methods=['get'], url_path='get-character')
    def get_character(self, request):
        try:
            user = request.user
            serializer = CharacterSerializer(user, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in get_character: {str(e)}")
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['post'], url_path='change-item')
    def change_item(self, request):
        user = request.user
        inventory_item_id = request.data.get('inventory_item_id')

        if not inventory_item_id:
            return Response({'error': 'inventory_item_id is required'}, status=400)

        try:
            inventory_item = Inventory.objects.get(id=inventory_item_id, user=user)

            if not (inventory_item.is_unlocked and inventory_item.is_purchased):
                return Response(
                    {'error': 'Item is not unlocked or purchased'},
                    status=400
                )

            item_type = inventory_item.item.type

            # Снимаем все экипированные предметы того же типа
            # Для hair/headwear обрабатываем как одну группу
            if item_type in ['hair', 'headwear']:
                Inventory.objects.filter(
                    user=user,
                    is_equipped=True
                ).filter(
                    Q(item__type='hair') | Q(item__type='headwear')
                ).update(is_equipped=False)
            else:
                # Для других типов (top, bottom, boots) снимаем только предметы того же типа
                Inventory.objects.filter(
                    user=user,
                    is_equipped=True,
                    item__type=item_type
                ).update(is_equipped=False)

            # Надеваем выбранный предмет
            inventory_item.is_equipped = True
            inventory_item.save()

            serializer = CharacterSerializer(user)
            return Response({
                'status': 'item changed',
                'character': serializer.data
            })

        except Inventory.DoesNotExist:
            return Response({'error': 'Item not found in inventory'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)



class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['post'], url_path='unlock')
    def unlock(self, request, pk=None):
        try:
            user = request.user
            item = get_object_or_404(Shop, pk=pk)

            # Проверяем, есть ли требуемый ранг у предмета
            if item.required_rank:
                # Проверяем ранг пользователя
                if not user.current_rank:
                    return Response(
                        {"detail": "У пользователя нет текущего ранга"},
                        status=400
                    )
                # Сравниваем ранги
                if user.current_rank.id < item.required_rank.id:
                    return Response(
                        {"detail": f"Требуется ранг {item.required_rank.name} или выше"},
                        status=400
                    )

            # Проверяем, не разблокирован ли уже предмет
            if Inventory.objects.filter(user=user, item=item).exists():
                return Response({"detail": "Предмет уже разблокирован"}, status=400)

            # Создаем запись в инвентаре
            Inventory.objects.create(
                user=user,
                item=item,
                is_unlocked=True,
                is_purchased=False
            )
            
            return Response({"detail": "Предмет успешно разблокирован"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['post'], url_path='purchase')
    def purchase(self, request, pk=None):
        try:
            user = request.user
            item = self.get_object()

            inventory_item = Inventory.objects.filter(user=user, item=item).first()
            if inventory_item and inventory_item.is_purchased:
                return Response({"detail": "Предмет уже куплен."}, status=400)

            if user.gold < item.price:
                return Response({"detail": "Недостаточно золота для покупки."}, status=400)

            user.gold -= item.price
            user.save()

            if inventory_item:
                inventory_item.is_purchased = True
                inventory_item.save()
            else:
                Inventory.objects.create(
                    user=user,
                    item=item,
                    is_unlocked=True,
                    is_purchased=True
                )

            return Response({"detail": "Предмет успешно куплен."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.select_related('user').prefetch_related('collaborators__user').filter(
            Q(user=self.request.user) | 
            Q(collaborators__user=self.request.user, collaborators__accepted=True)
        ).distinct()

    def perform_create(self, serializer):
        # Automatically set the user and calculate rewards
        task = serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        
        # Проверяем, является ли пользователь участником задачи
        if not (task.user == request.user or 
                task.collaborators.filter(user=request.user, accepted=True).exists()):
            return Response({"detail": "Вы не участвуете в этой задаче"}, status=403)
        
        # Проверяем условия коллаборации
        if task.collaboration_type == 2:  # Все должны завершить
            # Помечаем, что этот пользователь завершил
            collaborator = task.collaborators.get(user=request.user, accepted=True)
            collaborator.completed = True
            collaborator.save()
            
            # Проверяем, все ли завершили (включая владельца)
            all_collaborators_completed = not task.collaborators.filter(accepted=True, completed=False).exists()
            owner_completed = task.is_completed if task.user != request.user else True
            
            if all_collaborators_completed and owner_completed:
                task.is_completed = True
                # Начисляем награду всем участникам
                participants = [task.user] + list(task.collaborators.filter(accepted=True).values_list('user', flat=True))
                for user_id in participants:
                    user = User.objects.get(id=user_id)
                    user.xp += task.reward_xp
                    user.gold += task.reward_gold
                    user.save()
        else:  # Любой может завершить
            task.is_completed = True
            # Начисляем награду всем участникам
            participants = [task.user] + list(task.collaborators.filter(accepted=True).values_list('user', flat=True))
            for user_id in participants:
                user = User.objects.get(id=user_id)
                user.xp += task.reward_xp
                user.gold += task.reward_gold
                user.save()
        
        task.save()
        return Response({'status': 'Task completed.'})
    
    @action(detail=True, methods=['delete'], url_path='remove-collaborator/(?P<collaborator_id>[^/.]+)')
    def remove_collaborator(self, request, pk=None, collaborator_id=None):
        task = self.get_object()
        
        # Проверяем права доступа
        if task.user != request.user:
            return Response({"detail": "Only the owner can remove collaborators."}, status=403)
        
        try:
            collaborator = TaskCollaborator.objects.get(
                task=task, 
                user_id=collaborator_id
            )
            collaborator.delete()
            return Response({"detail": "Collaborator removed successfully."}, status=200)
        except TaskCollaborator.DoesNotExist:
            return Response({"detail": "Collaborator not found."}, status=404)
        except Exception as e:
            return Response({"detail": f"Error removing collaborator: {str(e)}"}, status=500)

    @action(detail=True, methods=['post'])
    def uncomplete(self, request, pk=None):
        task = self.get_object()
        if task.is_completed:
            task.is_completed = False
            task.save()
            user = request.user

            # Проверяем, чтобы не уйти в минус
            user.xp = max(0, user.xp - task.reward_xp)
            user.gold = max(0, user.gold - task.reward_gold)
            user.save()

            return Response({
                'status': 'Task uncompleted.',
                'reward_xp': -task.reward_xp,
                'reward_gold': -task.reward_gold,
                'user': UserSerializer(user).data,
            })
        else:
            return Response({'status': 'Task already uncompleted.'}, status=400)
        
    @action(detail=True, methods=['post'], url_path='delete')
    def delete(self, request, pk=None):
        task = self.get_object()
        if task.user != request.user:
            return Response({"detail": "Only the owner can delete the task."}, status=403)
        
        if task.is_completed:
            task.delete()
            return Response({'status': 'Task deleted.'}, status=204)
        else:
            print("aborting")
            user = request.user
            
            user.xp = max(0, user.xp - 2 * task.reward_xp)
            user.gold = max(0, user.gold - 2 * task.reward_gold)
            user.save() 
            task.delete()
            
            return Response({
                'status': "Task aborted.",
                'user': UserSerializer(user).data,
            })
        
        


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Login and return a JWT token.
        """
        view = TokenObtainPairView.as_view()
        return view(request._request)

from rest_framework import serializers

class UpdateEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class UserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)  # This should include email from UserSerializer

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser]  # Убедитесь, что парсеры правильно настроены
    )
    def upload_avatar(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')

        if not avatar:
            print("No avatar uploaded")  # Логирование ошибки
            return Response({"error": "No avatar provided"}, status=400)

        print(f"Uploaded avatar: {avatar.name}")  # Логирование имени файла

        # Продолжить обработку загрузки
        user.avatar = avatar
        user.save()
        return Response({
            "detail": "Avatar updated successfully!",
            "avatar_url": request.build_absolute_uri(user.avatar.url)
        })
    
    
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """
        Изменение пароля пользователя
        """
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            request.user.change_password(
                serializer.validated_data['current_password'],
                serializer.validated_data['new_password']
            )
            return Response({"detail": "Пароль успешно изменен"}, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Ошибка при изменении пароля"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['patch'], url_path='update-profile')
    def update_profile(self, request):
        """
        Обновление профиля пользователя (имя и email)
        """
        serializer = UpdateProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            request.user.update_profile(
                name=serializer.validated_data.get('name'),
                email=serializer.validated_data.get('email')
            )
            
            # Возвращаем обновленные данные пользователя
            user_serializer = UserSerializer(request.user)
            return Response({
                "detail": "Профиль успешно обновлен",
                "user": user_serializer.data
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Ошибка при обновлении профиля"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def logout(self, request):
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # This invalidates the refresh token
                return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

class RankViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rank.objects.all()
    serializer_class = RankSerializer


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

class UpdateProfileSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)


    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """
        Изменение пароля пользователя
        """
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            request.user.change_password(
                serializer.validated_data['current_password'],
                serializer.validated_data['new_password']
            )
            return Response({"detail": "Пароль успешно изменен"}, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Ошибка при изменении пароля"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['patch'], url_path='update-profile')
    def update_profile(self, request):
        """
        Обновление профиля пользователя (имя и email)
        """
        serializer = UpdateProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            request.user.update_profile(
                name=serializer.validated_data.get('name'),
                email=serializer.validated_data.get('email')
            )
            
            # Возвращаем обновленные данные пользователя
            user_serializer = UserSerializer(request.user)
            return Response({
                "detail": "Профиль успешно обновлен",
                "user": user_serializer.data
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Ошибка при обновлении профиля"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#! FRIENDS SECTION

class UserSearchView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        query = request.query_params.get("q", "")
        users = User.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        ).exclude(id=request.user.id)
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)


class FriendRequestViewSet(viewsets.ModelViewSet):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Получаем параметр для фильтрации (только входящие или все)
        request_type = self.request.query_params.get('type', 'all')
        
        if request_type == 'sent':
            # Только отправленные запросы
            return FriendRequest.objects.filter(from_user=self.request.user)
        elif request_type == 'received':
            # Только полученные запросы
            return FriendRequest.objects.filter(to_user=self.request.user)
        else:
            # Все запросы (отправленные и полученные) - по умолчанию
            return FriendRequest.objects.filter(
                Q(from_user=self.request.user) | Q(to_user=self.request.user)
            )

    def perform_create(self, serializer):
        to_user_id = self.request.data.get("to_user")
        if not to_user_id:
            raise ValidationError({"to_user": "Обязательное поле"})
        if FriendRequest.objects.filter(from_user=self.request.user, to_user_id=to_user_id).exists():
            raise ValidationError({"detail": "Запрос уже отправлен"})
        serializer.save(from_user=self.request.user, to_user_id=to_user_id)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        friend_request = self.get_object()
        if friend_request.to_user != request.user:
            return Response({"detail": "Нельзя принять чужой запрос"}, status=403)
        
        # Создаем дружбу
        Friendship.befriend(friend_request.from_user, friend_request.to_user)
        
        # Удаляем запрос после принятия
        friend_request.delete()
        
        return Response({"status": "accepted"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        friend_request = self.get_object()
        if friend_request.to_user != request.user:
            return Response({"detail": "Нельзя отклонить чужой запрос"}, status=403)
        friend_request.delete()
        return Response({"status": "rejected"})



class FriendshipViewSet(viewsets.ModelViewSet): 
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Friendship.objects.filter(Q(user1=self.request.user) | Q(user2=self.request.user))
    
    def destroy(self, request, *args, **kwargs):
        try:
            friendship = self.get_object()
            
            # Проверяем, что пользователь является участником дружбы
            if request.user not in [friendship.user1, friendship.user2]:
                return Response({"detail": "Нельзя удалить чужую дружбу"}, status=403)
            
            friendship.delete()
            return Response({"status": "deleted"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class TaskCollaboratorViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCollaboratorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskCollaborator.objects.filter(
            Q(user=self.request.user) | Q(invited_by=self.request.user)
        )

    def perform_create(self, serializer):
        user_id = self.request.data.get("user")
        serializer.save(invited_by=self.request.user, user_id=user_id)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        collaborator = self.get_object()
        if collaborator.user != request.user:
            return Response({"detail": "Вы не можете принять чужое приглашение"}, status=403)
        collaborator.accepted = True
        collaborator.save()
        return Response({"status": "accepted"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        collaborator = self.get_object()
        if collaborator.user != request.user:
            return Response({"detail": "Вы не можете отклонить чужое приглашение"}, status=403)
        collaborator.delete()
        return Response({"status": "rejected"})

class CollaborationCheckView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'], url_path='check-collaboration')
    def check_collaboration(self, request):
        try:
            collaborator_ids = request.data.get('collaborators', [])
            task_id = request.data.get('task_id')
            
            # Проверяем, что все коллабораторы являются друзьями
            for collaborator_id in collaborator_ids:
                collaborator = User.objects.get(id=collaborator_id)
                
                if not Friendship.are_friends(request.user, collaborator):
                    return Response({
                        "detail": f"Пользователь {collaborator.email} не является вашим другом",
                        "user_id": collaborator_id
                    }, status=400)
            
            return Response({"detail": "Все пользователи являются друзьями"}, status=200)
            
        except User.DoesNotExist:
            return Response({"detail": "Пользователь не найден"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

#! END OF FRIENDS SECTION

class CollaborationInvitationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='send-invitation')
    def send_invitation(self, request):
        try:
            task_id = request.data.get('task_id')
            collaborator_ids = request.data.get('collaborator_ids', [])
            
            task = Task.objects.get(id=task_id, user=request.user)
            
            created_count = 0
            already_exists_count = 0
            
            for collaborator_id in collaborator_ids:
                collaborator = User.objects.get(id=collaborator_id)
                if not Friendship.are_friends(request.user, collaborator):
                    return Response({
                        "detail": f"Пользователь {collaborator.email} не является вашим другом"
                    }, status=400)
                
                # Проверяем, не было ли уже приглашения
                if TaskCollaborator.objects.filter(task=task, user=collaborator).exists():
                    already_exists_count += 1
                    continue
                
                # Создаем приглашение
                TaskCollaborator.objects.create(
                    task=task,
                    user=collaborator,
                    invited_by=request.user,
                    accepted=False
                )
                created_count += 1
            
            task.collaboration_status = 1  # Ожидание
            task.save()
            
            message = f"Приглашения отправлены. Создано: {created_count}, уже существовало: {already_exists_count}"
            return Response({"detail": message}, status=200)
            
        except Task.DoesNotExist:
            return Response({"detail": "Задача не найдена"}, status=404)
        except User.DoesNotExist:
            return Response({"detail": "Пользователь не найден"}, status=404)


    @action(detail=False, methods=['get'], url_path='pending-invitations')
    def pending_invitations(self, request):
        invitations = TaskCollaborator.objects.filter(
            user=request.user,
            accepted=False
        )
        serializer = TaskCollaboratorSerializer(invitations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='respond-invitation')
    def respond_invitation(self, request, pk=None):
        try:
            invitation = TaskCollaborator.objects.get(id=pk, user=request.user)
            accept = request.data.get('accept', False)
            
            if accept:
                invitation.accepted = True
                invitation.save()
                
                # Проверяем, все ли приняли приглашение
                task = invitation.task
                pending_invitations = TaskCollaborator.objects.filter(
                    task=task,
                    accepted=False
                ).count()
                
                if pending_invitations == 0:
                    task.collaboration_status = 2  # Принято
                    task.save()
                
                return Response({"detail": "Приглашение принято"}, status=200)
            else:
                invitation.delete()
                
                # Обновляем статус задачи
                task = invitation.task
                task.collaboration_status = 3  # Отклонено
                task.save()
                
                return Response({"detail": "Приглашение отклонено"}, status=200)
                
        except TaskCollaborator.DoesNotExist:
            return Response({"detail": "Приглашение не найдено"}, status=404)
        
    @action(detail=False, methods=['get'], url_path='pending-invitations')
    def pending_invitations(self, request):
        invitations = TaskCollaborator.objects.filter(
            user=request.user,
            accepted=False
        ).select_related('task', 'invited_by')
        serializer = TaskCollaboratorSerializer(invitations, many=True)
        return Response(serializer.data)
    
class CollaborationTaskViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Задачи, где пользователь является коллаборатором
        return Task.objects.filter(
            collaborators__user=self.request.user,
            collaborators__accepted=True
        )