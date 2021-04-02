var positive=["pleasure", "hope", "trust"];
var negative=["fear", "aversion", "anger", "sadness"];

function selectFont(emotion){
    let lyricDiv = document.getElementById("txt" + "0");

    //폰트
    //var tmpEmotion=lyric_emotions[0]["emotion"];

    if(tmpEmotion == "pleasure" || tmpEmotion =="hope"){
        lyricDiv.setAttribute('class', 'gothic '+tmpEmotion);
    } else if (tmpEmotion == "truth" || tmpEmotion =="surprise"){
        lyricDiv.setAttribute('class', 'myeongjo '+tmpEmotion);
    } else if (tmpEmotion == "fear" || tmpEmotion =="sadness"){
        lyricDiv.setAttribute('class', 'son1 '+tmpEmotion);
    } else {
        lyricDiv.setAttribute('class', 'son2 '+tmpEmotion);
    }
}

