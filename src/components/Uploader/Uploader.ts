// import { errorToString } from "../../core/utils";
// import { ModalError } from "../Error";
// import { Modal } from "../Modal";
// import { ApiClient } from "../../api/api-client";
// import { UploadInput } from "./UploadInput";
// import { navigate } from "../../core/router";
// import { routes } from "../../routes.definition";
// import { ConfirmModal } from "../modals/confirm-modal";
// import { Toast } from "../Toast";
// import { LS } from "../../core/LS";

// export const Uploader = (fetchPreviewDocs: () => void): HTMLElement => {
//    const form = document.createElement("form");
//    form.classList.add(
//       "flex",
//       "flex-col",
//       "items-center",
//       "justify-center",
//       "w-full",
//       "mt-5",
//       "mb-6"
//    );

//    const inputEl = UploadInput();

//    form.append(inputEl.target);

//    function handleSubmit(res: Response) {
//       if (!res.body) {
//          throw new Error("body is null");
//       }
//       const reader = res.body.getReader();
//       new ReadableStream({
//          start(controller) {
//             return pump();
//             function pump() {
//                return reader.read()
//                .then(({ done, value }) => {
//                   if (done) {
//                      controller.close();
//                      return;
//                   }
//                   try {
//                      const text = new TextDecoder().decode(value).split("\n");
//                      for (const line of text) {
//                         if (!line) continue;
//                         const json = JSON.parse(line);
//                         if (json.status === 102) {
//                            if (!json.data) return;
//                            if ("total" in json.data && "progress" in json.data) {
//                               inputEl.progress(json.data);
//                            }
//                         } else if (json.status === 200) {
//                            Toast.success("Your document was published");
//                            console.log("response:", json);
//                            inputEl.reset();
//                            fetchPreviewDocs();
//                         } else {
//                            return Promise.reject(json.data);
//                         }
//                      }
//                   } catch (error) {
//                      console.warn("decode error:", error);
//                   }
//                   controller.enqueue(value);
//                   return pump();
//                })
//                .catch((error) => {
//                   Modal.show(
//                      "Publishing error",
//                      ModalError("We were not able to publish your document :(", error),
//                      inputEl.reset
//                   );
//                })
//             }
//          },
//       });
//    }

//    form.onsubmit = (e) => {
//       e.preventDefault();

//       if (inputEl.fileValue().length > 0) {
//          inputEl.disable();
//          const formData = new FormData();
//          formData.append("file", inputEl.fileValue()[0]);
//          ApiClient.publishDocumentFile(formData).then(handleSubmit);
//       } else {
//          if (!inputEl.value()) {
//             return;
//          }

//          function handleDocumentPublish() {
//             inputEl.disable();
//             ApiClient.publishDocumentUrl(inputEl.value()).then(handleSubmit);
//          }

//          if (!ClientStorage.hasToken()) {
//             ConfirmModal(
//                "You are about to publish a document without an account. You won't be able to manage your documents in this case:( Are you positive you want to continue?",
//                {
//                   label: routes.auth.label,
//                   fn: () => navigate(routes.auth.pathname + routes.auth.search),
//                },
//                { label: "Publish", fn: handleDocumentPublish }
//             );

//          } else {
//             handleDocumentPublish();
//          }
//       }
//    };

//    return form;
// };
