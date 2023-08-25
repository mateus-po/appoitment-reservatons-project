const ImageTool = window.ImageTool
const Header = window.Header
const Table = window.Table
const List = window.List

class Image extends ImageTool {
  // image destructor
  // if an image is deleted during editing an article, this function fires
  async destroy() {
    if (!this._data.file.url) return
    // sending a requiest to a server and awaiting a response
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
  tools: {
      image: {
          class: Image,
          inlineToolbar: true,
          config: {
            endpoints: {
              byFile: '/uploadFile', // Your backend file uploader endpoint
              byUrl: '/fetchUrl', // Your endpoint that provides uploading by Url
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
  tools: {
    image: {
        class: Image,
        inlineToolbar: true,
        config: {
          endpoints: {
            byFile: '/uploadFile', // Your backend file uploader endpoint
            byUrl: '/fetchUrl', // Your endpoint that provides uploading by Url
          }
        },
      },

      table: {
        class: Table,
        inlineToolbar: true
      },
    }
})

