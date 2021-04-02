from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

app_name='viewzicQ'

urlpatterns = [path('', views.index, name='home'), #view의 인덱스 함수 실행. html에서 home이라는 이름 사용
    path('<int:music_id>/', views.detail, name="detail"),
    path('make/', views.upload_file, name="uploadFile"),
    path('login/', auth_views.LoginView.as_view(template_name='viewzicQ/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', views.signup, name='signup'),
]