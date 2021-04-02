// 색상 참고 : https://brandcolors.net/
// 이모지 참고 : https://www.w3schools.com/charsets/ref_emoji.asp

function emotion_to_color(emotion) {
    emotion_name = emotion['emotion']
    emotion_value = emotion['value']
    switch (emotion_name) {
        case "happiness": // 기쁨, 행복
            return '#ebffac'; // 노랑
        case "brightness": // 기대, 낭만적/밝음
            return '#cee3f8'; // 파랑
        case "calm": // 신뢰, 차분함
            return '#a4dbdb'; // 초록
        case "funky": // 놀라움, 펑키
            return '#ffc168'; // 주황
        case "dramatic": // 공포, 극적
            return '#788cb6'; // 연보라or남색
        case "sadness": // 슬픔
            return '#d6dde3' // 연그레이
        case "darkness": // 혐오, 어두움
            return '#c0c0c8'; // 다크그레이
        case "angry": // 분노, 화남
            return '#e66760'; // 빨강
    }
}


function emotion_to_emoji(emotion) {
    emotion_name = emotion['emotion']
    emotion_value = emotion['value']
    switch (emotion_name) {
        case "happiness": // 기쁨, 행복
            return ['&#128154;', '&#128155;'];
        case "brightness": // 기대, 낭만적/밝음
            return ['&#127752;', '&#127776;'];
        case "calm": // 신뢰, 차분함
            return ['&#127808;', '&#127808;'];
        case "funky": // 놀라움, 펑키
            return ['&#10024;', '&#10024;'];
        case "dramatic": // 공포, 극적
            return ['&#127750;', '&#127750;'];
        case "sadness": // 슬픔
            return ['&#128153;', '&#127754;'];
        case "darkness": // 혐오, 어두움
            return ['&#128420;', '&#128148;'];
        case "angry": // 분노, 화남
            return ['&#128293;', '&#128293;'];
    }
}

/*

<!DOCTYPE html>
<html>
<style>
body {
  font-size: 20px;
}
</style>
<body>


<br/>

<!-- 기쁨 -->
<div style="background-color:#ebffac;">
<span style='font-size:50px;'>&#128154;</span>
<span style='font-size:50px;'>&#128155;</span>
</div>
<br/>

<!-- 기대 -->
<div style="background-color:#cee3f8;">
<span style='font-size:50px;'>&#127752;</span>
<span style='font-size:50px;'>&#127776;</span>
</div>
<br/>

<!-- 신뢰 -->
<div style="background-color:#a4dbdb;">
<span style='font-size:50px;'>&#127808;</span>
<span style='font-size:50px;'>&#127808;</span>
</div>
<br/>

<!-- 놀라움 -->
<div style="background-color:#ffc168;">
<span style='font-size:50px;'>&#10024;</span>
<span style='font-size:50px;'>&#10024;</span>
</div>
<br/>

<!-- 공포 -->
<div style="background-color:#788cb6;">
<span style='font-size:50px;'>&#127750;</span>
<span style='font-size:50px;'>&#127750;</span>
</div>
<br/>

<!-- 슬픔 -->
<div style="background-color:#d6dde3;">
<span style='font-size:50px;'>&#128153;</span>
<span style='font-size:50px;'>&#127754;</span>
</div>
<br/>

<!-- 혐오 -->
<div style="background-color:#c0c0c8;">
<span style='font-size:50px;'>&#128420;</span>
<span style='font-size:50px;'>&#128148;</span>
</div>
<br/>

<!-- 분노 -->
<div style="background-color:#e66760;">
<span style='font-size:50px;'>&#128293;</span>
<span style='font-size:50px;'>&#128293;</span>
</div>
<br/>

</body>
</html>

*/