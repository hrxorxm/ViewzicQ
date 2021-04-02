import requests, json
import os


class Lyrics_anal:
    def __init__(self, filename):
        self.file = filename
        self.time_stamp = []
        self.lyrics = []

        with open(self.file, 'r') as file:
            for line in file:
                self.time_stamp.append(line.split(']')[0][1:])
                self.lyrics.append(line.split(']')[1][:-1])

        self.time_stamp = self.time_stamp[3:]
        self.lyrics = self.lyrics[3:]

    def getTimestamp(self):
        # 시간 문자열을 숫자로 바꾸기
        ftr = [60, 1]
        f = lambda x: sum([a * b for a, b in zip(ftr, map(float, x.split(':')))])
        times = [t for t in map(f, self.time_stamp)]
        times.insert(0, 0.0)

        return times

    def getLyrics(self):
        return self.lyrics

    def getEmotion(self):
        url = 'http://svc.saltlux.ai:31781'
        headers = {'Content-Type': 'application/json;'}
        data = {
            "key": "a4dfd367-39d4-4b04-8b36-2b30813ecc1d",
            "serviceId": "11987300804",
            "argument": {
                "type": "1",
                "query": "한국의 가을은 아름답습니다."
            }
        }
        '''
        with open(file, 'r') as file:
            apikey = file.read()
        
        data['key'] = "a4dfd367-39d4-4b04-8b36-2b30813ecc1d"
        
        result_part = []
        for line in self.lyrics:
            data['argument']['query'] = line
            res = requests.post(url, headers=headers, data=json.dumps(data))
            dic = json.loads(res.text)
            print(res)
            result_part.append(dic['Result'])

        data['argument']['query'] = ' '.join(self.lyrics)
        res = requests.post(url, headers=headers, data=json.dumps(data))
        dic = json.loads(res.text)
        result_all = dic['Result']
        '''
        # 전체 분석
        data['argument']['query'] = ' '.join(self.lyrics)
        res = requests.post(url, headers=headers, data=json.dumps(data))
        dic = json.loads(res.text)
        result = [dic['Result']]
        # 구절별 분석
        for line in self.lyrics:
            data['argument']['query'] = line
            res = requests.post(url, headers=headers, data=json.dumps(data))
            dic = json.loads(res.text)
            result.append(dic['Result'])

        return result
