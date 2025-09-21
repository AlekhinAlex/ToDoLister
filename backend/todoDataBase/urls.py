from django.urls import include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    RegisterViewSet, UserViewSet, TaskViewSet, CharacterViewSet,
    CustomTokenObtainPairView, LogoutViewSet, ShopViewSet, RankViewSet,
    UserSearchView, FriendRequestViewSet, FriendshipViewSet, TaskCollaboratorViewSet,
    CollaborationCheckView, CollaborationInvitationViewSet, CollaborationTaskViewSet,
)

router = DefaultRouter()
router.register(r'register', RegisterViewSet, basename='register')
router.register(r'tasks', TaskViewSet)
router.register(r'user', UserViewSet, basename='user')
router.register(r'logout', LogoutViewSet, basename='logout')
router.register(r'character', CharacterViewSet, basename='character')
router.register(r'shop', ShopViewSet, basename='shop')
router.register(r'ranks', RankViewSet, basename='rank')
router.register(r'check-collaboration', CollaborationCheckView, basename='checkcollaboration')
router.register(r'user-search', UserSearchView, basename='usersearch')
router.register(r'friend-requests', FriendRequestViewSet, basename='friendrequest')
router.register(r'friendships', FriendshipViewSet, basename='friendship')
router.register(r'task-collaborators', TaskCollaboratorViewSet, basename='taskcollaborator')
router.register(r'collaboration-invitations', CollaborationInvitationViewSet, basename='collaborationinvitation')
router.register(r'collaboration-tasks', CollaborationTaskViewSet, basename='collaborationtask')

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)