from django.urls import include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    RegisterViewSet, UserViewSet, TaskViewSet, CharacterViewSet,
    CustomTokenObtainPairView, LogoutViewSet
)

router = DefaultRouter()
router.register(r'register', RegisterViewSet, basename='register')
router.register(r'tasks', TaskViewSet)
router.register(r'user', UserViewSet, basename='user')
router.register(r'logout', LogoutViewSet, basename='logout')
router.register(r'character', CharacterViewSet)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)