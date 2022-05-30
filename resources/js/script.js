import { Editor } from "./editor.js";
import { Tools } from "./tools.js";

class App {

    constructor() {

        this.toolSelection = null;

        this.tools  = new Tools(this);
        this.editor = new Editor(this);
        this.editor.initialize(16, 16);

        // Modal
        var modal = document.getElementById("modal");
        document.getElementById("new").onclick = function() {
            modal.style.display = "block";
        }
        document.getElementById("new-project").onclick = () => {
           this.editor.initialize(
               document.getElementById('width' ).value,
               document.getElementById('height').value
           );
           modal.style.display = "none";
        }
        document.getElementById("close").addEventListener('click', ()=> {
            modal.style.display = "none";
        });
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        // Save
        document.getElementById("download").onclick = () => {
           this.editor.download();
        }

    }

}

const app = new App();

