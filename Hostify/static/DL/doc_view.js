const view = document.querySelector("#view");
const str = replace("&nbsp;", "", view.innerHTML);

view.innerHTML = '';
view.innerHTML += str;

const style = document.querySelector("#view-style");
console.log(style.innerHTML)

style.innerHTML = removeAllWhiteSpaces(style.innerHTML)

function replace(current, newcurrent, textContent = ""){
    let text = "";
    let sameCount = 0;

    for (let i = 0; i < textContent.length; i++){
        if (current[0] === textContent[i]){
            for (let j = 0; j < current.length; j++){
                if (current[j] == textContent[i + j]) sameCount++;
                else {
                    sameCount = 0;
                    break;
                }
            }
        }

        if (sameCount == current.length){
            text += newcurrent;
            i += sameCount - 1;
            sameCount = 0;
        }
        else{
            text += textContent[i];
        }
    }

    return String(text);
}

function removeAllWhiteSpaces(text){
    txt = "";

    Array.from(text).forEach(char => {
        if (char != 0){
            txt += char;
        }
    });

    return String(txt)
}