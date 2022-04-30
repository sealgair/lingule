from django.urls import path
from solution import views

urlpatterns = [
    path('word.json', views.WordView.as_view(), name='word'),
    path('guess.json', views.GuessView.as_view(), name='guess'),
]