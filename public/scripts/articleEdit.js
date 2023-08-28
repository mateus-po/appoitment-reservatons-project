const ImageTool = window.ImageTool
const Header = window.Header
const Table = window.Table
const List = window.List
const SaveButton = document.getElementById('Save')

sideReady = async () => {
    try {
        const res = await fetch(decodeURI(location.href).slice(0,-5), {
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
        }

    } catch (err) {
        console.log(err)
    }

}



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
        save()
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
  onReady: sideReady,
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

const save = async (alertingMode = true) => {
    try {
        const mainData = await main_editor.save()
        const sideData = await side_editor.save()

        const res = await fetch(decodeURI(location.href), {
            method: 'POST',
            body: JSON.stringify({ 
                articleData: mainData,
                sideBody: sideData,
                lastEdited: mainData.time
            }),
            headers: {'Content-type': 'application/json'}
        })
        if (res.status != 201) {
            const data = await res.json()
            alert(data.error)
        }
        else {
            if (alertingMode) alert("Article has been successfully saved")
        }

    } catch (err) {
        console.log(err)
    }
}

SaveButton.addEventListener('click', save)
