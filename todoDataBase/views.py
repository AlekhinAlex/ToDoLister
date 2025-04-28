from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.exceptions import ValidationError, APIException
from django.shortcuts import get_object_or_404

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
        return Inventory.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='get-character')
    def get_character(self, request):
        try:
            serializer = CharacterSerializer(request.user)
            return Response(serializer.data)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except APIException as e:
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=['get'], url_path='change-item')
    def change_item(self, request):
        user = request.user
        inventory_item_id = request.data.get('inventory_item_id')

        if not inventory_item_id:
            return Response({'error': 'inventory_item_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        inventory_item = get_object_or_404(Inventory, id=inventory_item_id, user=user)
        item_type = inventory_item.item.type
        
        Inventory.objects.filter(user=user, item__type=item_type, is_equipped=True).update(is_equipped=False)
        inventory_item.is_equipped = True
        inventory_item.save()

        return Response({'status': 'item changed', 'equipped_item': UserItemSerializer(inventory_item).data})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()  # Add this if missing
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        if not task.is_completed:
            task.is_completed = True
            task.save()
            character = Character.objects.get(user=request.user)
            character.xp += task.reward_xp
            character.gold += task.reward_gold
            character.save()

            return Response({
                'status': 'Task completed.',
                'reward_xp': task.reward_xp,
                'reward_gold': task.reward_gold,
                'character': CharacterSerializer(character).data,
            })
        else:
            return Response({'status': 'Task already completed.'}, status=400)
    @action(detail=True, methods=['post'])
    def uncomplete(self, request, pk=None):
        task = self.get_object()
        if task.is_completed:
            task.is_completed = False
            task.save()
            character = Character.objects.get(user=request.user)

            # Проверяем, чтобы не уйти в минус
            character.xp = max(0, character.xp - task.reward_xp)
            character.gold = max(0, character.gold - task.reward_gold)
            character.save()

            return Response({
                'status': 'Task uncompleted.',
                'reward_xp': -task.reward_xp,
                'reward_gold': -task.reward_gold,
                'character': CharacterSerializer(character).data,
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
        parser_classes=[MultiPartParser, FormParser]
    )
    def upload_avatar(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')

        if avatar:
            user.avatar = avatar
            user.save()
            return Response({
                "detail": "Avatar updated successfully!",
                "avatar_url": request.build_absolute_uri(user.avatar.url)
            })

        return Response({"error": "No avatar provided"}, status=400)


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
