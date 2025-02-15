// import { navigate } from "../../core/router";
// import { routes } from "../../routes.definition";
// import { ActionButton } from "../Button";
// import { Modal } from "../Modal";

// export const NotEnoughRightsModal = () => {
//    const text = document.createElement("span");
//    text.innerText = "Only joined users have rights to upload files, anonymous ones can publish pdf documents as web urls";
//    text.classList.add("text-sm", "mb-4", "text-zinc-700", "text-center");
//    const authLink = ActionButton(routes.auth.label);
//    authLink.classList.add("self-center");
//    authLink.onclick = () => {
//       Modal.hide();
//       navigate(routes.auth.pathname + routes.auth.search);
//    };
//    const el = document.createElement("div");
//    el.classList.add("flex-1", "flex", "flex-col", "justify-center");
//    el.append(text, authLink);
//    Modal.show("Not enough rights :(", el);
// };