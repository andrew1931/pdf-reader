// import { LS } from "../../core/LS";
// import { Document } from "../DocumentSlider/Document";
// import { AttachmentIcon } from "../icons/attachment";
// import { CloseIcon } from "../icons/close";
// import { PublishIcon } from "../icons/publish";
// import { NotEnoughRightsModal } from "../modals/not-enough-rights-modal";

// export const UploadInput = () => {
//    const input = document.createElement("input");
//    input.setAttribute("placeholder", "Enter url or press the clip ->");
//    input.classList.add(
//       "w-full",
//       "pl-4",
//       "pr-20",
//       "disabled:opacity-50",
//       "h-full",
//       "border-0",
//       "rounded-[inherit]",
//       "text-base",
//    );

//    const closeIcon = document.createElement("button");
//    closeIcon.innerHTML = CloseIcon;
//    closeIcon.classList.add(
//       "w-4",
//       "ml-2"
//    );
//    const attachedFileName = document.createElement("span");
//    attachedFileName.classList.add(
//       "w-11/12",
//       "overflow-hidden",
//       "text-ellipsis",
//       "whitespace-nowrap"
//    );
//    const attachedFileWrapper = document.createElement("div");
//    attachedFileWrapper.classList.add(
//       "file-attached",
//       "flex",
//       "justify-between",
//       "rounded-full",
//       "py-1",
//       "px-2",
//       "absolute",
//       "left-2",
//       "hidden",
//       "font-medium",
//       "text-xs",
//       "max-w-[70%]",
//       "md:max-w-[80%]"
//    );
//    attachedFileWrapper.append(attachedFileName, closeIcon);

//    const fileInput = document.createElement("input");
//    fileInput.classList.add("hidden");
//    fileInput.setAttribute("type", "file");
//    fileInput.setAttribute("accept", "application/pdf");
//    fileInput.onchange = () => {
//       if (fileInput.files) {
//          attachedFileName.innerText = fileInput.files[0].name;
//          attachedFileWrapper.classList.remove("hidden");
//          input.value = "";
//          input.disabled = true;
//          Document.parseAndShow(fileInput.files[0]);
//       }
//    };

//    closeIcon.onclick = () => {
//       attachedFileWrapper.classList.add("hidden");
//       fileInput.value = "";
//       input.disabled = false;
//    };

//    const btnClassList = [
//       "w-4",
//       "md:w-6",
//       "md:p-1",
//       "transition-[width]",
//       "active:text-button-600",
//       "mx-2",
//       "rounded-full"
//    ];

//    const btn = document.createElement("button");
//    btn.classList.add(...btnClassList);
//    btn.setAttribute("type", "submit");
//    btn.innerHTML = PublishIcon;
//    btn.onclick = () => {
//       btn.blur();
//    };

//    const fileBtn = document.createElement("button");
//    fileBtn.classList.add(...btnClassList);
//    fileBtn.setAttribute("type", "button");
//    fileBtn.innerHTML = AttachmentIcon;
//    fileBtn.onclick = () => {
//       if (!LS.hasToken()) {
//          NotEnoughRightsModal();
//       } else {
//          fileInput.click();
//       }
//       fileBtn.blur();
//    };

//    const btnWrapper = document.createElement("div");
//    btnWrapper.classList.add(
//       "rounded-[inherit]",
//       "text-button-500",
//       "right-1",
//       "h-full",
//       "pl-2",
//       "absolute",
//       "flex",
//       "items-center",
//       "justify-center"
//    );
//    btnWrapper.append(fileBtn, btn);

//    const progressBar = document.createElement("div");
//    progressBar.classList.add(
//       "bg-green-500",
//       "left-0",
//       "h-full",
//       "absolute",
//       "opacity-80",
//    );
//    progressBar.style.width = "0%";

//    const progressText = document.createElement("div");
//    progressText.classList.add(
//       "progress-text",
//       "left-0",
//       "h-full",
//       "w-full",
//       "absolute",
//       "flex",
//       "items-center",
//       "justify-center",
//       "-z-10"
//    );
//    progressText.innerText = "0%";

//    const inputWrapper = document.createElement("div");
//    inputWrapper.classList.add(
//       "w-11/12",
//       "md:w-9/12",
//       "max-w-2xl",
//       "my-1",
//       "h-10",
//       "mb-2",
//       "border",
//       "border-yellow-500",
//       "rounded-3xl",
//       "relative",
//       "flex",
//       "items-center",
//       "overflow-hidden"
//    );
//    inputWrapper.append(
//       fileInput,
//       input,
//       attachedFileWrapper,
//       btnWrapper,
//       progressText,
//       progressBar,
//    );

//    return {
//       target: inputWrapper,
//       value() {
//          return input.value.trim();
//       },
//       fileValue() {
//          return fileInput.files || [];
//       },
//       reset() {
//          input.value = "";
//          input.disabled = false;
//          fileInput.value = "";
//          fileInput.disabled = false;
//          btn.disabled = false;
//          fileBtn.disabled = false;
//          progressBar.style.width = "0px";
//          progressText.classList.add("-z-10");
//          progressText.innerText = "0%";
//          attachedFileWrapper.classList.add("hidden");
//       },
//       disable() {
//          input.disabled = true;
//          fileInput.disabled = true;
//          btn.disabled = true;
//          fileBtn.disabled = true;
//          progressText.classList.remove("-z-10");
//       },
//       progress(value: { total: number, progress: number }) {
//          const percents = (value.progress * 100) / value.total;
//          progressBar.style.width = `${percents}%`;
//          progressText.innerText = `${Math.round(percents)}%`;
//       }
//    };
// };
