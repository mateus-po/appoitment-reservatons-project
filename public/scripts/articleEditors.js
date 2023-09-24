const ImageTool = window.ImageTool
const Header = window.Header
const Table = window.Table
const List = window.List

let mainReady = () => {}
let sideReady = () => {}

class Image extends ImageTool {

  // image destructor
  async destroy() {
    if (!this._data.file.url) return
  
    try {
        const res = await fetch('/deleteFile', {
            method: 'DELETE',
            body: JSON.stringify({path: this._data.file.url}),
            headers: {'Content-type': 'application/json'}
        })
        if (res.status != 201) 
        {
          console.log(await res.text())
        }
    } catch (err) {
        console.log(err)
    }
  }
}

const main_editor = new EditorJS({
  autofocus: true,
  inlineToolbar: true,
  onReady: mainReady,
  tools: {
      image: {
          class: Image,
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
        class: Image,
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

