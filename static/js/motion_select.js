//{func: ffCircle("txt0", { radius: 3, direction: "clock", start_angle: 0, end_angle: 360 }),delay: 0, duration: 2, iteration: 2, start_time: 0}
function make_motion(lyrics, lyric_emotions, features, times){
    var motData_arr = new Array(); // 리턴할 모션 리스트 변수
    var scaleMot=onset_to_scale(features[0]['oenv'], features[0]['time_oenv'],times);

    for (var j = 0; j < scaleMot.length; j++){
        motData_arr.push(scaleMot[j]);
    }

    for (var i = 0; i < times.length; i++) {
        // 기본 변수 : (delay=0), duration, (iteration=1), start_time
        var duration = 0, start_time = times[i];
        if (i < times.length - 1){
            duration = times[i + 1] - times[i];
        } else{
            duration = 10;
        }

        // 감정-모션 맵핑
        var motName = emotion_to_motion(lyric_emotions[0]['emotion']); // 전체 감정값
        if(lyric_emotions[i]["value"] > 0.7){
            motName = emotion_to_motion(lyric_emotions[i]["emotion"]); // 부분 감정값
        }
        // 모션 변수 세팅 후 저장
        var curMotions = motion_info_setting(lyrics[i], motName, features[i+1]['cent'], features[i+1]['time_cent'],features[i+1]['tempo'][0], start_time, duration, features[0]['max_cent'],);
        for (var j = 0; j < curMotions.length; j++){
            motData_arr.push(curMotions[j]);
        }
    }
    return motData_arr;
}

function onset_to_scale(oenv, time_oenv, times){
    var scaleMotions=new Array();

    var max = oenv[oenv.length-1]["value"];
    var max_index = oenv[oenv.length-1]["index"];

    var j=0;
    var start_time=0;
    var end_time=0;

    for(var i=0; i<oenv.length-1; i++){
        if(oenv[i]<max*0.8 || (time_oenv[i]>start_time && time_oenv[i]<end_time)){
            continue;
        }

        start_time=time_oenv[i];
        start_time=parseFloat(Number(start_time).toFixed(1));
        for(j;j<times.length;j++){
            if(start_time>times[j-1] && start_time<times[j]){
                end_time=times[j];
                break;
            }
        }
        var scale=oenv[i]/max*1.1;
        scale= parseFloat(scale.toFixed(1))+0.1;

        increase_duration=end_time-start_time

         if(increase_duration<1){
            continue
        }

        scaleMotions.push({func:ffStaticScale("txt0",{scaleX: scale, scaleY: scale}),
            delay:0, duration: increase_duration, iteration:1, start_time: start_time});


    }
    return scaleMotions;
}

function spec_to_scale(cent,time_cent,duration, max_cent){
    var scaleMotions=new Array();
    for(var i=0;i<cent.length;i++){
        if(cent[i]>max_cent*0.95){
            scale=cent[i]/max_cent*1.1;
            scale= parseFloat(scale.toFixed(1))+0.1;
            scaleMotions.push({func:ffStaticScale("txt0",{scaleX: scale, scaleY: scale}),
                delay:0, duration: duration-time_cent[i], iteration:1, start_time: time_cent[i]});
        }
    }
    return scaleMotions;
}

function emotion_to_motion(emotion){
    switch(emotion){
        case "pleasure":
            return "bouncing";
        case "hope":
            return "scale-up";
        case "trust":
            return "wave";
        case "surprise":
            return "blink";
        case "fear":
            return "x";
        case "sadness":
            return "down";
        case "aversion":
            return "swing";
        case "anger":
            return "shake";
    }
}

function motion_info_setting(lyric, motion, cent, time_cent, tempo, start_time, duration,max_cent){
    var curMotions = new Array();

    var scaleMot=spec_to_scale(cent,time_cent,duration,max_cent );
     for (var j = 0; j < scaleMot.length; j++){
        curMotions.push(scaleMot[j]);
    }
    
    // centroid
    var cent_sum = cent.reduce((previous, current) => current += previous);
    var cent_avg = cent_sum / cent.length;
    var cent_min = 500, cent_max = 7000; // centroid 값 범위 조절
    cent_avg = (cent_avg > cent_max) ? cent_max : ((cent_avg < cent_min) ? cent_min : cent_avg);

    // tempo
    var t_min = 50, t_max = 200; // tempo 값 범위 조절
    tempo = (tempo > t_max) ? t_max : ((tempo < t_min) ? t_min : tempo);

    switch(motion){
        case "bouncing": // circle + line
            // circle, line 변수 설정
            var r_min = 2, r_max = 5;
            var r = parseInt((r_max - r_min)*(cent_avg - cent_min) / (cent_max - cent_min) + r_min);
            // 방향 바꿀 변수
            var ord = 0, i = 0;
            var dir = [{dir:"clock", route:"ltor", s:180, e:0},
                       {dir:"anti", route:"rtol", s:180, e:360}];
            for(i = 0; i < duration; i++){
                // 방향 바꿔주기
                ord = parseInt((i + 1)/2) % 2;
                // circle
                curMotions.push({func:ffCircle("txt0",{radius: r, direction: dir[ord].dir, start_angle: dir[ord].s, end_angle: dir[ord].e}),
                delay:0, duration: 1, iteration:1, start_time:start_time+i});
                // lines
                curMotions.push({func:ffLine("txt0",{line_route : dir[ord].route, length: r*2}),
                delay:0, duration: 1, iteration:1, start_time:start_time+i});
            }
            // 원위치로
            if(i % 2 != 0){
                ord = parseInt((i + 1)/2) % 2;
                // circle
                curMotions.push({func:ffCircle("txt0",{radius: r, direction: dir[ord].dir, start_angle: dir[ord].s, end_angle: dir[ord].e}),
                delay:0, duration: 0, iteration:1, start_time:start_time+duration});
                // lines
                curMotions.push({func:ffLine("txt0",{line_route : dir[ord].route, length: r*2}),
                delay:0, duration: 0, iteration:1, start_time:start_time+duration});
            }
            break;
        case "scale-up": // scale
            var iter_min=1, iter_max=4;
            var iter= parseInt(iter_min+ (iter_max - iter_min)*(tempo - t_min) / (t_max - t_min));

            curMotions.push({func:ffStaticScale("txt0",{scaleX: 1.3, scaleY: 1.3}),
            delay:0, duration: duration, iteration:iter, start_time: start_time});

            break;
        case "wave": // wave
            // wave
            curMotions.push({func:ffWave("txt0"),
            delay:0, duration: duration, iteration:3 , start_time: start_time});
            break;
        case "blink": // blink
            // blink 변수 설정
            var n_min = 2, n_max = 6; // num_per_second 범위 : 2~8
            var num_per_second = parseInt((n_max - n_min)*(tempo - t_min) / (t_max - t_min) + n_min);
            // blink
            curMotions.push({func:ffStaticBlink("txt0",{opacity: 0, num_per_second: num_per_second}),
            delay:0, duration: duration, iteration:1, start_time: start_time});
            break;
        case "x": // shake
           var l_min=2, l_max=8;
            var length= parseInt(l_min+ (l_max - l_min)*(tempo - t_min) / (t_max - t_min));
            var length2=length/(Math.sqrt(2));
            length2.toFixed(1)

             curMotions.push({func:ffLine("txt0",{line_route : "diag_ul", length: length/2}),
                delay:0, duration: 0 , iteration:1, start_time: start_time});
            curMotions.push({func:ffLine("txt0",{line_route : "diag_dr", length: length}),
                delay:0, duration: duration/2 , iteration:1, start_time: start_time});
            curMotions.push({func:ffLine("txt0",{line_route : "dtou", length: length2}),
                delay:0, duration: 0 , iteration:1, start_time: start_time+(duration/2)});
            curMotions.push({func:ffLine("txt0",{line_route : "diag_dl", length: length}),
                delay:0, duration: duration/2 , iteration:1, start_time:start_time+(duration/2)});
            curMotions.push({func:ffLine("txt0",{line_route : "diag_ur", length: length/2}),
                delay:0, duration: 0 , iteration:1, start_time: start_time+duration});

            break;

        case "down": // appear+line(utod)

            var l_min=2, l_max=7
            var length= l_min+ (l_max - l_min)*(tempo - t_min) / (t_max - t_min)
            length.toFixed(1)

            var appear_duration = duration - (duration * (tempo - t_min) / (t_max - t_min))

            curMotions.push({func:ffLine("txt0",{line_route: "ltor", length: length}),
                delay:0, duration: duration, iteration:1, start_time: start_time});

            curMotions.push({func:ffAppearance("txt0",{mode: "right"}),
                delay:0, duration: appear_duration, iteration:1, start_time: start_time});

            //curMotions.push({func:ffLine("txt0",{line_route: "rtol", length: length}),
                //delay:0, duration: 0, iteration:1, start_time: start_time+duration});
             curMotions.push({func:ffLine("txt0",{line_route: "rtol", length: length-( 15 * 2.54 / 96)}),
                delay:0, duration: 0, iteration:1, start_time: start_time+duration});
            break;
        case "swing": // rotation
            var iter_min=1, iter_max=5;
            var iter= parseInt(iter_min+ (iter_max - iter_min)*(tempo - t_min) / (t_max - t_min));
            var iter=iter*(parseInt(duration/10))+1;

            var a_min=8, a_max=25;
            var angle= parseInt(a_min+ (a_max - a_min)*(tempo - t_min) / (t_max - t_min));

            if (iter==1){
                curMotions.push({func:ffStaticRotation("txt0",{angle:angle, axis : "center"}),
                    delay:0, duration: duration/3, iteration:1, start_time: start_time});
                curMotions.push({func:ffStaticRotation("txt0",{angle:-(angle*2), axis : "center"}),
                    delay:0, duration: duration/3*2, iteration:1, start_time: start_time+duration/3});
                curMotions.push({func:ffStaticRotation("txt0",{angle:angle, axis : "center"}),
                    delay:0, duration: 0, iteration:1, start_time: start_time+duration});
                break;
            }

            else {
                iter_dur=3+4*(iter-1);
                dur=duration/iter_dur;

                curMotions.push({func:ffStaticRotation("txt0",{angle:angle, axis : "center"}),
                    delay:0, duration: dur, iteration:1, start_time: start_time});
                curMotions.push({func:ffStaticRotation("txt0",{angle:-(angle*2), axis : "center"}),
                    delay:0, duration:dur*2, iteration:1, start_time: start_time+dur});

                for (var i=0;i<iter-1;i++){
                    curMotions.push({func:ffStaticRotation("txt0",{angle: angle*2, axis : "center"}),
                        delay:0, duration: dur*2, iteration:1, start_time: start_time+dur*(3+4*i)});
                    curMotions.push({func:ffStaticRotation("txt0",{angle:-(angle*2), axis : "center"}),
                        delay:0, duration: dur*2, iteration:1, start_time: start_time+dur*(5+4*i)});
                }

                curMotions.push({func:ffStaticRotation("txt0",{angle:angle, axis : "center"}),
                    delay:0, duration: 0, iteration:1, start_time: start_time+duration});
                break;
            }

        case "shake": // shake
           // shake 변수 설정
            var c_min = 1, c_max = 4; // shake_count 범위 : 4~6
            var shake_count = parseInt((c_max - c_min)*(tempo - t_min) / (t_max - t_min) + c_min);
            if(shake_count==1){
                shake_count=2;
            }
            // shake
            curMotions.push({func:ffStaticShake("txt0",{shake_count: shake_count, direction: "all"}),
            delay:0, duration: duration, iteration:1, start_time: start_time});
            break;

        default:
            break;
    }
    return curMotions;
}