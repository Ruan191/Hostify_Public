from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('register', views.register, name="register"),
    path('login', views._login, name="login"),
    path('logout', views._logout, name="logout"),
    path('validation', views._validation, name="validation"),
    path('create_log', views.create_log, name="create_log"),
    path('logs', views.logs, name="logs"),
    path('doc_data/<str:token>', views.doc_data, name="doc_data"),
    path('doc/<str:token>', views.doc, name="doc"),
    path('view/<str:token>', views.view, name="view"),
    
]