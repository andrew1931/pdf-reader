// import { ContentContainer } from "../components/ContentContainer";
// import {
//     navigate,
//     useNavigationEnter,
//     useQueryParamsChange
// } from "../core/router";
// import { A } from "../components/EssentialLinks";
// import { Footer } from "../components/Footer";
// import { routes } from "../routes.definition";
// import { H1 } from "../components/Title";
// import { ResetPasswordForm } from "../components/Auth/ResetPassword";
// import { ClientStorage } from "../core/storage";

// export const ForgotPasswordPage = (): HTMLElement => {

//    const authLink = A(routes.auth.label, () => {
//       navigate(routes.auth.pathname + routes.auth.search);
//    });
//    authLink.classList.add("ml-2");
//    const homeLink = A("Return Home", () => {
//       navigate(routes.home.pathname);
//    });

//    const links = document.createElement("div");
//    links.classList.add("w-full", "flex", "justify-center", "pt-4", "mb-8");
//    links.append(homeLink, authLink);

//    const resetPasswordForm = ResetPasswordForm(
//       () => navigate(routes.auth.pathname + routes.auth.search)
//    );

//    const wrapper = document.createElement("div");
//    wrapper.classList.add(
//       "rounded-md",
//       "w-11/12",
//       "md:py-12",
//       "md:px-16",
//       "max-w-md",
//       "mx-auto"
//    );
//    wrapper.append(
//       H1("Let's reset your password"),
//       links,
//       resetPasswordForm.target,
//       Footer(true)
//    );

//    useNavigationEnter(() => {
//       if (ClientStorage.hasToken()) {
//          navigate(routes.home.pathname);
//       } else {
//          resetPasswordForm.reset();
//       }
//    });

//    return ContentContainer(wrapper);
// };
