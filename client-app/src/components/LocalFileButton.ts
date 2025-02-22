import { DB, KeyExistsError, NotEnabledError } from "../core/DB";
import { errorToString } from "../core/utils";
import { Document } from "./DocumentSlider/Document";
import { PdfReader } from "../pdf-reader";
import { AttachmentIcon } from "./icons/attachment";
import { Toast } from "./Toast";

export const LocalFileButton = () => {
    const fileInput = document.createElement("input");
    fileInput.classList.add("hidden");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("accept", "application/pdf");
    fileInput.onchange = () => {
        if (fileInput.files) {
            const file = fileInput.files[0];
            fileInput.value = "";
            PdfReader.read(file)
                .then((pdf) => {
                    DB.addFile(file, {
                        title: pdf.title,
                        author: pdf.author,
                        numberOfPages: pdf.numberOfPages,
                    })
                        .then(() => Document(pdf, file.name, 0))
                        .catch((error) => {
                            if (
                                error instanceof KeyExistsError ||
                                error instanceof NotEnabledError
                            ) {
                                console.warn(error);
                                Document(pdf, file.name, 0);
                            } else {
                                Toast.error(error);
                            }
                        });
                })
                .catch((error) => {
                    Toast.error(
                        "Oops, we are not able to show this document: " + errorToString(error)
                    );
                });
        }
    };

    const buttonText = document.createElement("span");
    buttonText.innerText = "Choose File";
   
    const buttonIcon = document.createElement("span");
    buttonIcon.innerHTML = AttachmentIcon;
    buttonIcon.classList.add("w-4", "mr-2");

    const fileBtn = document.createElement("button");
    fileBtn.setAttribute("aria-label", "Choose local file");
    fileBtn.append(buttonIcon, buttonText);
    fileBtn.classList.add(
        "btn",
        "flex",
        "items-center",
        "justify-center", 
        "px-6",
        "text-sm",
        "font-semibold",
        "h-11",
        "md:h-10",
        "rounded-3xl",
        "text-slate-50",
        "bg-button-500",
        "active:bg-button-600",
        "md:active:bg-button-600",
        "disabled:bg-button-400",
    );
    fileBtn.setAttribute("type", "button");
    fileBtn.onclick = () => {
        fileInput.click();
        fileBtn.blur();
    };

    const wrapper = document.createElement("div");
    wrapper.classList.add("mx-auto", "my-6");
    wrapper.append(fileInput, fileBtn);
    return wrapper;
};