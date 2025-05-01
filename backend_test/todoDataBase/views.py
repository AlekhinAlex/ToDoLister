from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError, APIException
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import User, Task, Shop, Inventory
from .serializers import (
    UserSerializer, RegisterSerializer, TaskSerializer,
    ItemSerializer, UserItemSerializer, CharacterSerializer,
    CustomTokenObtainPairSerializer
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
            print(f"User: {user.email}")
            print(f"Inventory items: {user.inventory.all().count()}")

            # Проверка данных перед сериализацией
            for item in user.inventory.all():
                print(f"Inventory item {item.id}: item={item.item.id}, equipped={item.is_equipped}")

            serializer = CharacterSerializer(user)
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

    @action(detail=True, methods=['post'], url_path='unlock')
    def unlock(self, request, pk=None):
        user = request.user
        item = get_object_or_404(Shop, pk=pk)

        if Inventory.objects.filter(user=user, item=item).exists():
            return Response({"detail": "Уже разблокировано"}, status=400)

        if user.xp < item.required_xp:
            return Response({"detail": "Недостаточно XP"}, status=400)

        user.xp -= item.required_xp
        user.save()

        Inventory.objects.create(user=user, item=item, is_unlocked=True, is_purchased=False)
        return Response({"detail": "Успешно разблокировано"})

    @action(detail=True, methods=['post'], url_path='purchase')
    def purchase(self, request, pk=None):
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
            Inventory.objects.create(user=user, item=item, is_unlocked=True, is_purchased=True)

        return Response({"detail": "Предмет успешно куплен."}, status=200)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user and calculate rewards
        task = serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        if not task.is_completed:
            task.is_completed = True
            task.save()
            user = request.user
            user.xp += task.reward_xp
            user.gold += task.reward_gold
            user.save()

            return Response({
                'status': 'Task completed.',
                'difficulty': task.get_difficulty_display(),
                'reward_xp': task.reward_xp,
                'reward_gold': task.reward_gold,
                'user': UserSerializer(user).data,
            })
        else:
            return Response({'status': 'Task already completed.'}, status=400)

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
            return Response({'status': 'Task is not completed.'}, status=400)



# Add TokenObtainPairView and TokenRefreshView for login functionality
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
