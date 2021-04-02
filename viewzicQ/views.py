from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import UserForm
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from .models import Song
from .models import SongInfo
from .lyric_anal import Lyrics_anal
from .music_anal import music_analysis
from .info_save import emotionKrtoEng
from .album_art import extract_image
from urllib import parse
import os
import json

SONG_FILE_TYPES = ['mp3', 'wav']
LYRIC_FILE_TYPE = 'lrc'


# Create your views here.

def signup(request):
    """
    계정생성
    """
    if request.method == "POST":
        form = UserForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('/')
    else:
        form = UserForm()
    return render(request, 'viewzicQ/signup.html', {'form': form})


@login_required(login_url='viewzicQ:login')
def index(request):
    page = request.GET.get('page', '1')
    kw = request.GET.get('kw', '')

    music_list = Song.objects.filter(user=request.user).order_by('singer')

    if kw:
        music_list = music_list.filter(
            Q(title__icontains=kw) |
            Q(singer__icontains=kw)
        ).distinct()

    paginator = Paginator(music_list, 10)  # 페이지당 5개씩 보여주기
    page_obj = paginator.get_page(page)

    context = {'music_list': page_obj, 'kw': kw}
    return render(request, 'viewzicQ/music_home.html', context)

@login_required(login_url='viewzicQ:login')
def detail(request, music_id):
    music = Song.objects.get(id=music_id)
    try:
        music_info = SongInfo.objects.get(song_id=music_id)
    except ObjectDoesNotExist:
        context = motion_info_context(music)
        return render(request, "viewzicQ/music_detail.html", context)

    # 가사 분석 객체 선언
    lyrics_anal = Lyrics_anal(music.lyric_file.path)
    times = lyrics_anal.getTimestamp()
    lyrics = lyrics_anal.getLyrics()

    # 가사, 타임스탬프 준비
    lyrics.insert(0, music.title + ' - ' + music.singer)
    j_times = json.dumps(times)
    j_lyrics = json.dumps(lyrics)

    context = {'music': music, 'times': j_times, 'lyrics': j_lyrics, 'info': music_info}

    return render(request, "viewzicQ/music_detail.html", context)


@login_required(login_url='viewzicQ:login')
def upload_file(request):
    song = request.FILES['upload_music']
    img, title, artist = extract_image(song)

    # 노래 객체 저장
    music = Song()
    music.user = request.user
    music.title = title
    music.singer = artist
    music.song_file = song
    music.lyric_file = request.FILES['upload_lyric']
    music.image_file = img
    music.save()

    context = motion_info_context(music)

    return render(request, "viewzicQ/music_detail.html", context)


def motion_info_context(music):
    # 가사 분석 객체 선언
    lyrics_anal = Lyrics_anal(music.lyric_file.path)
    times = lyrics_anal.getTimestamp()
    lyrics = lyrics_anal.getLyrics()

    # 가사 감정 분석
    result = lyrics_anal.getEmotion()
    lyric_emotions = []
    for emotion in result:
        dic = {'emotion': emotionKrtoEng(emotion[0][1]), 'value': emotion[0][0]}
        lyric_emotions.append(dic)

    # 음악 분석
    music_length, features, music_emotions = music_analysis(music.song_file.path, times)

    # 노래 정보 객체 저장
    music_info = SongInfo()
    music_info.song = music
    music_info.lyric_emotions = lyric_emotions
    music_info.music_emotions = music_emotions
    music_info.features = features
    music_info.length = music_length
    music_info.save()

    # 가사, 타임스탬프 준비
    lyrics.insert(0, music.title + ' - ' + music.singer)
    j_times = json.dumps(times)
    j_lyrics = json.dumps(lyrics)

    context = {'music': music, 'times': j_times, 'lyrics': j_lyrics, 'info': music_info}

    return context
