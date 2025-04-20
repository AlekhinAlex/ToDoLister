from django.urls import include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    RegisterViewSet, UserViewSet, CharacterViewSet, TaskViewSet,
    ItemViewSet, UserItemViewSet, SkinViewSet, UnlockedSkinViewSet,
    CharacterAppearanceViewSet, CustomTokenObtainPairView, LogoutViewSet
)

router = DefaultRouter()
router.register(r'register', RegisterViewSet, basename='register')
router.register(r'character', CharacterViewSet, basename='character')
router.register(r'tasks', TaskViewSet)
router.register(r'items', ItemViewSet)
router.register(r'user-items', UserItemViewSet)
router.register(r'skins', SkinViewSet)
router.register(r'unlocked-skins', UnlockedSkinViewSet)
router.register(r'appearance', CharacterAppearanceViewSet)
router.register(r'user', UserViewSet, basename='user')
router.register(r'logout', LogoutViewSet, basename='logout')

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)