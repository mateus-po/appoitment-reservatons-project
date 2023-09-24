const ImageTool = window.ImageTool
const Header = window.Header
const Table = window.Table
const List = window.List

sideReady = async () => {
    try {
        const res = await fetch(decodeURI(location.href), {
            method: 'POST',
            body: JSON.stringify({type: 'body'}),
            headers: {'Content-type': 'application/json'}
        })
        if (res.status != 201) {
            const data = await res.json()
            error_box.innerHTML = data.error;
        }
        else {
            data = await res.json()
            console.log(data)
            await main_editor.render(JSON.parse(data.body))
            await side_editor.render(JSON.parse(data.sideBody))
            main_editor.readOnly.toggle()
            side_editor.readOnly.toggle()
        }

    } catch (err) {
        console.log(err)
    }

}

const main_editor = new EditorJS({
  autofocus: true,
  inlineToolbar: true,
  tools: {
      image: {
          class: ImageTool,
          inlineToolbar: true,
          config: {
            endpoints: {
              byFile: '/uploadFile', 
              byUrl: '/fetchUrl', 
            }
          },
        },
        header: {
          class: Header,
          inlineToolbar: true,
        },
        table: {
          class: Table,
          inlineToolbar: true
        },
        list: {
          class: List,
          inlineToolbar: true
        }
  }
});

const side_editor = new EditorJS({
  holder: "Right",
  onReady: sideReady,
  tools: {
    image: {
        class: ImageTool,
        inlineToolbar: true,
        config: {
          endpoints: {
            byFile: '/uploadFile', 
            byUrl: '/fetchUrl', 
          }
        },
      },

      table: {
        class: Table,
        inlineToolbar: true
      },
    }
})

