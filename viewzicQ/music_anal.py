import librosa
import librosa.display
from scipy.io import wavfile
from pydub import AudioSegment
import os
import numpy as np
import matplotlib.pyplot as plt
import keras
from sklearn import preprocessing
import collections


class music_pre:
    def __init__(self, filename):
        self.filename = filename
        self.title = os.path.splitext(filename)[0]
        self.isWav = True if os.path.splitext(filename)[1] == ".wav" else False
        self.musicChunkArr = []
        self.path = filename

    def load_music(self):  # mp3 to wav
        if not self.isWav:
            AudioSegment.from_mp3(self.title + ".mp3").export(self.title + ".wav", format="wav")
            self.path = self.title + ".wav"

    def split_music(self, time_arr):
        self.load_music()
        music = AudioSegment.from_wav(self.path)

        # split music
        start = 0
        music_arr = []
        for index, time in enumerate(time_arr):
            if (index == 0):
                continue
            # 현재 인덱스
            save_music = self.title + str(index + 1)
            finish = time * 1000
            # 저장
            music_chunk = music[start:finish]
            music_chunk.export(save_music + ".wav", format="wav")  # 위치 정하기
            music_arr.append(save_music + ".wav")
            # 다음 인덱스
            start = finish
        # 마지막 청크까지 저장
        music_chunk = music[start:]
        music_chunk.export(self.title + str(len(time_arr) + 1) + ".wav", format="wav")
        music_arr.append(self.title + str(len(time_arr) + 1) + ".wav")
        self.musicChunkArr = music_arr

    def delete_music(self):
        for music in self.musicChunkArr:
            os.remove(music)
        if not self.isWav:
            os.remove(self.path)  # wav로 변환한 전체 노래 파일 삭제


def music_analysis(filename, time_stamp):
    # 음악 전체 길이
    y, sr = librosa.load(filename)
    music_length = librosa.get_duration(y=y, sr=sr)

    # 수정
    hop_length = 512
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)  # 발병 감지(db등 에너지 변화)
    time_oenv = librosa.times_like(oenv, sr=sr, hop_length=hop_length)

    oenv, time_oenv = simplifyFeatures(oenv.tolist(), time_oenv.tolist())
    max_oenv = max(oenv)
    index_max = oenv.index(max_oenv)
    oenv.append({"value": max_oenv, "index": index_max})

    # 음악 전처리 객체
    musicpre = music_pre(filename)
    # 음악 청크 분리
    musicpre.split_music(time_stamp)
    music_arr = musicpre.musicChunkArr

    # 모델 임포트
    child_path = os.path.join("models", "8_94_0")
    checkpoint_path = os.path.join(os.getcwd(), child_path)
    model = keras.models.load_model(checkpoint_path)
    print(model.summary())

    # 라벨 인코딩 준비
    le = preprocessing.LabelEncoder()
    # Y = np.array(['angry', 'calm', 'darkness', 'dramatic', 'funky', 'happiness', 'romantic', 'sadness'])
    Y = np.array(['angry', 'calm', 'darkness', 'dramatic', 'funky', 'happiness', 'brightness', 'sadness'])
    Y_le = le.fit_transform(Y).reshape(Y.shape[0], 1)
    #print(Y_le)

    # 음악 청크에 대해서
    features = [{'oenv':oenv, 'time_oenv':time_oenv}]
    music_emotions = []

    max_cent=0

    for music in music_arr:
        # 음악 분석
        y, sr = librosa.load(music)
        hop_length = 512
        oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)  # 발병 감지(db등 에너지 변화)
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)  # 스펙트럼 중심(주파수로 변환) --> 대략적인 높낮이
        time_cent = librosa.times_like(cent, sr=sr, hop_length=hop_length)
        #time_oenv = librosa.times_like(oenv, sr=sr, hop_length=hop_length)
        tempo = librosa.beat.tempo(onset_envelope=oenv, sr=sr)

        cent, time_cent=simplifyFeatures(cent[0].tolist(), time_cent.tolist())
        if len(features)==1 or max_cent<max(cent):
            max_cent=max(cent)

        '''
        템포그램
        tempogram = librosa.feature.tempogram(onset_envelope=oenv, sr=sr,hop_length=hop_length)
        '''

        tmp = {'cent': cent, 'time_cent': time_cent, 'tempo': tempo.tolist()}

        features.append(tmp)

        # 음악 감정 분석
        # Create mel spectrogram and convert it to the log scale
        sr = 16000
        n_mels = 128
        n_fft = 2048
        hop_length = 512
        y, sr = librosa.load(music, sr=sr)
        S = librosa.feature.melspectrogram(y, sr=sr, n_mels=n_mels, n_fft=n_fft, hop_length=hop_length)
        log_S = librosa.amplitude_to_db(S, ref=1.0)
        # 입력 데이터 형식 변환
        length = 94  # 3 sec
        spectrogram = []
        slices = int(log_S.shape[1] / length)
        for j in range(slices):
            spectrogram.append(log_S[:, length * j:length * (j + 1)])
        if len(spectrogram) < 1:  # 3초보다 작을 때
            # spectrogram.append(log_S)
            dic = {'emotion': 'null', 'value': 0.0}
            music_emotions.append(dic)
            continue
        X = np.array(spectrogram)
        X_input = X.reshape(X.shape + (1,))
        # 예측하기
        y_score = model.predict_proba(X_input)
        y_predict = np.argmax(y_score, axis=1)
        y_predict_score = np.max(y_score, axis=1)
        # Make result
        class_names_original = le.inverse_transform(y_predict)
        count = collections.Counter(class_names_original)
        mood = count.most_common(1)[0][0]
        score = np.max([y_predict_score[i] for i, j in enumerate(class_names_original) if j == mood])
        score = score.tolist()

        # print(music, mood, score)
        dic = {'emotion': mood, 'value': score}
        music_emotions.append(dic)

    features[0]['max_cent'] = max_cent
    musicpre.delete_music()


    return music_length, features, music_emotions


def simplifyFeatures(feature, time):
    feature=list(map(int,feature))
    new_feature = [feature[0]]
    new_time = [0.0]

    try:
        comp = increaseValue(feature[0], feature[1])
    except:
        # len(feature) <= 1 일 때 에러나면 그냥 0으로 처리
        comp = 0

    tmp = None
    for i, value in enumerate(feature):
        if i == 0:
            continue

        if i == 1:
            tmp = value
            continue

        if i == len(feature) - 1:
            new_feature.append(value)
            new_time.append(time[i])
            break

        now = increaseValue(tmp, value)

        if comp == now or now == 0:
            tmp = value
            continue

        elif comp != now:
            tmp = value

            if comp == 0:
                comp = now
                continue

            comp = now
            new_feature.append(feature[i - 1])
            new_time.append(time[i - 1])

    return new_feature, new_time


def increaseValue(a, b):
    if b > a:
        return 1
    elif b == a:
        return 0
    else:
        return -1
