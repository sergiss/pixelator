import { Editor } from "./editor.js";
import { Tools } from "./tools.js";


class App {

    constructor() {

        this.toolSelection = null;

        this.tools  = new Tools(this);
        this.editor = new Editor(this);

    }

}

const app = new App();

