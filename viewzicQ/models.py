from django.contrib.auth.models import User
from django.db import models
from jsonfield import JSONField
from PIL import Image

# Create your models here.


class Song(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    singer = models.CharField(max_length=50)
    song_file = models.FileField(upload_to="song/")
    lyric_file = models.FileField(upload_to="lyric/")
    image_file = models.ImageField(upload_to="image/")
    
    class Meta:
        unique_together = (('title', 'singer', 'user'),)


class SongInfo(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    lyric_emotions = JSONField(default=dict)
    music_emotions = JSONField(default=dict)
    features = JSONField(default=dict)
    length = models.FloatField()

