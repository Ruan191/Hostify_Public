const _csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

class Page{
    page;
    navButton;
    buttons = {};
    opened;
    temp_data = {};
    on_page_open;
    static pages = []
    static pageOpened;
    static renderPage;

    constructor(page, navButton, buttons = []){
        Page.pages.push(this);

        this.page = document.querySelector(`#${page}`);
        this.navButton = document.querySelector(`#${navButton}`)
        .addEventListener('click', async () => {
            Page.hideAll();
            this.page.style.display = 'block';
            this.opened = true;

            if (typeof(this.on_page_open) == 'function'){
                await this.on_page_open();
                Page.pageOpened = page;
            }
            Page.renderPage(page, this);
        });

        buttons.forEach(ele => {
            this.buttons[ele] = document.querySelector(`#${ele}`);
        });
    }

    static hideAll(){
        Page.pages.forEach(ele => {
            ele.page.style.display = 'none';
            ele.opened = false;
            ele.temp_data = {};
        })
    }

    refresh(){
        Page.renderPage(Page.pageOpened, this);
    }
}

const new_logs_page = new Page("new-logs-page", "nav-create-new-log", ["new-logs-create_btn"]);
const logs_page = new Page("logs-page", "nav-logs", []);

Page.hideAll();

new_logs_page.buttons["new-logs-create_btn"].addEventListener('click', async () => {
    const textfield = document.querySelector('#new-logs-name-field');
    //const html_file = document.querySelector('#html_file');
    //const css_file = document.querySelector('#css_file');

    await fetch('/create_log', {
        method: "POST",
        mode: 'same-origin',
        body: JSON.stringify({
            textfield: textfield.value,
            date: new Date(),
            token: _csrftoken
        }),
        headers: {
            'X-CSRFToken': _csrftoken
        }
    })

    textfield.value = '';
    console.log(html_file);
    location.reload()
})

let bubbles = false;

Page.renderPage = (page_name, page) => {
    switch (page_name) {
        case 'logs-page':
            let doc_data = page.temp_data.doc_data;
            let edit_mode = page.temp_data.edit_mode;
         
            logs_page.page.innerHTML = '<div"><h2>Logs</h2></div><div style="text-align: right;"><button id="log-edit"><i class="material-icons">edit</i></button></div>';
    
            if (!edit_mode) document.querySelectorAll('[name="del"]').forEach(delbtn => delbtn.remove());            

            let count = 0;

            doc_data.forEach(log => {
                const dateData = String(log.date).split("T");
                const date = dateData[0];
                const time = dateData[1].substr(0,5);
                const token = log.token;

                let delbtn = `<button name="del" id=${log.id} data-num="${count++}" class="doc-delete-btn">X</button>`;          

                let name = `<input class="doc-text-field"  value="${log.name}">`;

                if (!edit_mode) {
                    delbtn = "";
                    name = log.name;
                }
                logs_page.page.innerHTML +=         
                `<a href="/doc/${token}"><div class="log" id="${count}">
                ${delbtn}
                <ul>
                    <li class="doc-info">${name}</li>
                    <li class="doc-info" style="margin-left: 15px;">${time}&nbsp;|&nbsp;${date}</li>
                </ul>
                </div></a>`;

                count++;
            })

            if (edit_mode === true){
                
                document.querySelectorAll('[name="del"]').forEach(log => {
                    log.parentElement.parentElement.removeAttribute("href");

                    log.addEventListener('click', async (e) => {
                        e.stopPropagation();

                        await fetch('/logs', {
                            method: "POST",
                            body: JSON.stringify({
                                did: log.id
                            }),
                            headers: {
                                'X-CSRFToken': _csrftoken
                            }
                        });
                        
                        page.temp_data.doc_data.splice(log.dataset.num, 1);
                        const docs_count = document.querySelector("#docs_amount");

                        let c = parseInt(docs_count.textContent);
                        c--;
                        docs_count.innerHTML = c;

                        logs_page.refresh();
                        return false;
                    });
                });
            }

            document.querySelector('#log-edit').onclick = async () => {
                if (edit_mode){
                    let all_logs = document.querySelectorAll('.log');

                    for (let i = 0; i < all_logs.length; i++){
                        let textbox_value = document.querySelectorAll('.log')[i].children[1].children[0].children[0].value;

                        if (doc_data[i].name !== textbox_value){
                            doc_data[i].name = textbox_value

                            await fetch('/logs', {
                                method: "PUT",
                                body: JSON.stringify({
                                    id: doc_data[i].id,
                                    name: textbox_value
                                }),
                                headers:{
                                    'X-CSRFToken': _csrftoken
                                }
                            })
                        }
                    }
                    edit_mode = false
                }
                else edit_mode = true

                page.temp_data.edit_mode = edit_mode;
                logs_page.refresh();
            }
            break;
    
        default:
            break;
    }
}

logs_page.on_page_open = async () => {
    const response = await fetch('/logs');
    const data = await response.json();

    let edit_mode = false;
    let doc_data = [];
 
    data.forEach(log => {
        doc_data.push(log);
    });
    
    logs_page.temp_data["doc_data"] = doc_data;
    logs_page.temp_data["edit_mode"] = edit_mode;
}