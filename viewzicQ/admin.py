from django.contrib import admin
from .models import Song

# Register your models here.
class SongAdmin(admin.ModelAdmin):
    search_fields = ["title"]

admin.site.register(Song)