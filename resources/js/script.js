/*
 * Copyright (c) 2021, Sergio S.- sergi.ss4@gmail.com http://sergiosoriano.com
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *    	
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */

import { Editor } from "./editor.js";
import { Tools } from "./tools.js";

class App {

    constructor() {

        this.toolSelection = null;

        this.tools  = new Tools(this);
        this.editor = new Editor(this);
        this.editor.initialize(16, 16);

        // New Project
        const dropbtn = document.getElementById('dropbtn');
        dropbtn.addEventListener('click', (e)=> {
            document.getElementById("a").classList.add("show");
        });

        // Open file
        document.getElementById('open').addEventListener('click', (e)=> {
            this.editor.openImage();
            document.getElementById("a").classList.remove("show");
        });

        // Modal
        const modal = document.getElementById("modal");
        document.getElementById("new").addEventListener('click', ()=> {
            modal.style.display = "block";
            document.getElementById("a").classList.remove("show");
        });

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

        // Save
        document.getElementById("download").onclick = () => {
           this.editor.download();
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            } else if(event.target != dropbtn 
            && event.target != dropbtn.firstElementChild) {
                document.getElementById("a").classList.remove("show");
            }
        }

    }

}

const app = new App();

