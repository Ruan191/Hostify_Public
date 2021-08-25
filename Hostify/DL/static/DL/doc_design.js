const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const textarea = document.querySelector("#doc-textarea")
const save_btn = document.querySelector("#doc-save")
const doc_token = document.querySelector("#doc-token").value;
const html_design_view_btn = document.querySelector("#html-design-view");
const css_design_view_btn = document.querySelector("#css-design-view");
const visibility_btn = document.querySelector("#visibility-btn");
const char_count_ref = document.querySelector("#char-count");

let line_count = 0;
let focus_index = 0;
let tag_count = 0;
let doc_visible = undefined;

let char_count = 0;
let max_chars_allowed = 0;

let selected_line = null;
const onSelectedLineChange = new Event("selectedlinechanged");

class DesignTag{
    start;
    end;

    constructor(start, end = ""){
        this.start = start;
        this.end = end;
    }
}

class Counter{
    current_count
    ele_ref

    constructor(ele_ref){
        this.ele_ref = ele_ref;
        this.current_count = 0;
    }

    setValue(value){
        this.ele_ref.innerHTML = String(value);
    }

    changeValue(amount){
        //if (amount >= 0)
            char_count_ref.innerHTML = String((parseInt(char_count_ref.innerHTML) + (amount)));
        //else
            //char_count_ref.innerHTML = String((parseInt(char_count_ref.innerHTML) - (amount)));
    }
}

const html_design_tag = new DesignTag('<span class="html-tag">', "</span>");
const css_design_tag = new DesignTag('<span class="css-tag">', "</span>")
const char_counter = new Counter(document.querySelector("#char-count"));

let temp_char_count = 0;

const html_tags = ['<', '>']
const md_tags = ['#', '*']

let c = window.getSelection()
let lineText = "";
let previous_lineText = "";

function highLightText(line, setCursor = true){
    let text = "";
    let range = document.createRange();
    let html_tag_found = false;

    let sel = window.getSelection()
    let checkText = line.textContent;//lineText;
    console.log(line.textContent)
    let changeFound = false;

    if (current_state === 1){
        for (let i = 0; i < checkText.length; i++){
            if (checkText[i] == "<") {
                html_tag_found = true;
                text += ` ${html_design_tag.start}&lt;`;

            }
            else if (html_tag_found && checkText[i] == ">"){ 
                if (checkText[i + 1] == "&nbsp;"){
                    text += `&gt;${html_design_tag.end}`;
                }
                else {text += `&gt;${html_design_tag.end}`;};
            }
            else text += checkText[i];
    
            if (previous_lineText[i] != checkText[i] && setCursor && !changeFound){
                text += '<prev id="spot"></prev> ';
                changeFound = true;
            } 
        }
    }else{
        if (checkText.endsWith("{")) text = css_design_tag.start + checkText.substr(0, checkText.length - 1) + css_design_tag.end + "{";
        else text = checkText;  
    }
    
    if (current_state == 1){
        line.innerHTML = text + "&nbsp;";
    }
    else{
        line.innerHTML = text
    }
    let offset = 0;
    
    Array.from(line.children).forEach(child => {
        if (child.id != "spot") offset += 2;
    })

    if (setCursor){
        range.selectNode(line);
        range.setStart(line, offset);
        range.collapse(true);
        sel.removeAllRanges()
        sel.addRange(range)
    }
}

let states = new Array(2);
let current_state = 1;

document.addEventListener('DOMContentLoaded', async () => {
    let request = await fetch(`/doc_data/${doc_token}`);
    let response = await request.json();

    if (response.public){
        visibility_btn.innerHTML = "Public";
        doc_visible = true;
        visibility_btn.setAttribute("style", "background-color: rgb(194, 255, 145);")
    }
    else{
        visibility_btn.innerHTML = "Private";
        doc_visible = false;
        visibility_btn.setAttribute("style", "background-color: rgb(185, 87, 87);")
    }

    visibility_btn.addEventListener('click', () => {
        switchVisibility();
    })

    char_counter.setValue(String(response.html).length);
    char_counter.current_count = String(response.html).length;
    //char_count_ref.textContent = char_count;
    temp_char_count = char_counter.current_count;
    max_chars_allowed = response.max_chars_allowed;

    states[0] = response.css;
    states[1] = response.html;

    html_design_view_btn.setAttribute('style', 'background-color: rgb(233, 133, 52);');

    loadState(1);

    Array.from(textarea.children).forEach(line => {
        if (line.textContent !== ""){
            lineText = line.textContent;
            highLightText(line, false);
        }
    })

    textarea.addEventListener('paste', (e) => {
        e.preventDefault();
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        paste = replace('<', '&lt;', paste);
        paste = replace('>', '&gt;', paste);
        document.execCommand("insertHTML", false, replace('\n', '<br>', paste));

        saveState(current_state);
        loadState(current_state);

        return false;
    })
    
    //let keyIgnore = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"]

    document.addEventListener('keyup', e => {
        //e.preventDefault();
        if (document.activeElement.id == "doc-textarea") {
            previous_lineText = lineText;
            lineText = selected_line.textContent
            key = e.key;
            switch (key) {
                case "ArrowUp":
                    focus_index--;
                    selectLine(c.focusNode);
                    break;
                case "ArrowDown":
                    selectLine(c.focusNode);
                    break;
                case "Enter":
                    let all_enter_lines = document.querySelectorAll(".select");

                    for (let i = 0; i < all_enter_lines.length - 1; i++){
                        all_enter_lines[i].addEventListener('mouseup', e => {
                            selectLine(e.currentTarget);
                        });
    
                        all_enter_lines[i].removeAttribute("class");
                    }
                    break;
                case ">":
                    let markTag = document.createElement('b');
                    markTag.setAttribute("id", tag_count++)
                    selected_line.appendChild(markTag);
                    highLightText(selected_line);
                    break;
                case "{":
                    break;
                case "Alt":
                    document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                    return false;
                default:
                    char_counter.setValue(selected_line.textContent.length);
                    break;
            }
        }
    })

    document.addEventListener('keydown', e => {
        if (document.activeElement.id == "doc-textarea") {
            key = e.key;
            switch (key) {
                case "Backspace":
                        char_counter.changeValue(-getSelectedText().length)
                    break;
            }
        }
    })

    textarea.addEventListener('pointerup', (event) => {
        console.log(getSelectedText());
    });

    document.addEventListener('selectedlinechanged', () => {
        //char_counter.current_count 
    })

    html_design_view_btn.addEventListener('click', () => {
        if (current_state !== 1){
            current_state = 1;
            html_design_view_btn.setAttribute('style', 'background-color: rgb(233, 133, 52);');
            textarea.setAttribute('style', 'border-color: rgb(233, 133, 52);')
            css_design_view_btn.removeAttribute('style');
            saveState(0);
            textarea.innerHTML = "";
            loadState(1);      
        }
    })

    css_design_view_btn.addEventListener('click', () => {
        if (current_state !== 0){
            current_state = 0;
            css_design_view_btn.setAttribute('style', 'background-color: rgb(51, 177, 226);');
            textarea.setAttribute('style', 'border-color: rgb(51, 177, 226);')
            html_design_view_btn.removeAttribute('style');
            saveState(1);
            textarea.innerHTML = "&lt;style&gt;\n&lt;/style&gt;";
            loadState(0);           
        }
    })

    textarea.childNodes.forEach(ele => {
        ele.addEventListener('mouseup', e => {
            selectLine(e.currentTarget);
        });
    })
})

function switchVisibility(){
    if (doc_visible){
        doc_visible = false;
        visibility_btn.innerHTML = "Private";
        visibility_btn.setAttribute("style", "background-color: rgb(185, 87, 87);")
    }
    else{
        doc_visible = true;
        visibility_btn.innerHTML = "Public";
        visibility_btn.setAttribute("style", "background-color: rgb(194, 255, 145);")
    }
}

function selectLine(node){
    if (node.parentElement.id == "doc-textarea"){
        if (node.className === "select"){
            return;
        }

        let prev_line = selected_line ?? node;

        selected_line = node;
        prev_line.removeAttribute("class");
        selected_line.setAttribute("class", "select");
        document.dispatchEvent(onSelectedLineChange)
        return;
    }
    selectLine(node.parentElement);
}

function loadState(state_num){
    let textarea_lines = states[state_num].split('\n');
    let text = "";
    textarea.innerHTML = "";

    textarea_lines.forEach(line => {
        text += `<div id=${line_count++}>`;

        if (line.length == 0){
            text += "<br></div>";
            return;
        }
        for (let i = 0; i < line.length; i++){
            if (line[i] == "<"){
                text += `&lt;`;
            }else if (line[i] == ">"){
                text += `&gt;`;
            }else {
                text += line[i];
            }
        }
        text += "</div>";
    })

    textarea.innerHTML = text;

    Array.from(textarea.children).forEach(line => {
        if (line.textContent !== ""){
            lineText = line.textContent;
            highLightText(line, false);
        }
    })

    textarea.childNodes.forEach(ele => {
        ele.addEventListener('mouseup', e => {
            selectLine(e.currentTarget);
        });
    })
}

function saveState(state_num){
    states[state_num] = "";
    const break_key = "!~?";
    for (let i = 0; i < textarea.childNodes.length; i++){
        textarea.childNodes[i].innerHTML = replace("<br>", break_key, textarea.childNodes[i].innerHTML);
        let line_content = textarea.childNodes[i].textContent.split(break_key);
        
        if (line_content[0] !== ""){
            for (let j = 0; j < line_content.length; j++){
                if (i == textarea.childNodes.length - 1){
                   if (line_content[j] != "")
                        states[state_num] += line_content[j].replace(break_key, '\n');
                    else{
                        states[state_num] += line_content[j];
                    }
    
                }else{
                    
                    if (line_content[j] != "")
                        states[state_num] += line_content[j].replace(break_key, '\n') + "\n";
                    else{
                        states[state_num] += line_content[j];
                    }
                }
            }
        }else if (i !== textarea.childNodes.length - 1){
            states[state_num] += "\n";
        }
    }
}

save_btn.addEventListener('click', async () => {
    saveState(current_state);
    loadState(current_state);

    await fetch(`/doc/${doc_token}`, {
        method: "POST",
        body: JSON.stringify({
            "html": String(states[1]),//String(removeAllWhiteSpaces(states[1])),
            "css": String(states[0]),
            "isPublic": doc_visible
        }),
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
})

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

function getSelectedText() {
    let selectedText = '';
    selectedText = window.getSelection();
    return selectedText.toString();
}