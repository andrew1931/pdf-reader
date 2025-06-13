// import { ContentContainer } from "../components/ContentContainer";
// import { getSearchParam, navigate, useNavigationEnter, useQueryParamsChange } from "../core/router";
// import { A } from "../components/EssentialLinks";
// import { type Tab, Tabs } from "../components/Tabs";
// import { Footer } from "../components/Footer";
// import { routes } from "../routes.definition";
// import { SignInForm } from "../components/Auth/SignIn";
// import { SignUpForm } from "../components/Auth/SignUp";
// import { H1 } from "../components/Title";
// import { ClientStorage } from "../core/storage";

// export const AuthPage = (): HTMLElement => {
//    const queryKey = "type";
//    const tabs = {
//       signIn: "sign-in",
//       signUp: "sign-up"
//    };
//    const authTabs: Tab[] = [
//       { label: "Sign in", param: tabs.signIn },
//       { label: "Sign up", param: tabs.signUp }
//    ];

//    const forgotPassLink = A(routes.forgotPassword.label, () => {
//       navigate(routes.forgotPassword.pathname);
//    });
//    forgotPassLink.classList.add("ml-2");
//    const homeLink = A("Return Home", () => {
//       navigate(routes.home.pathname);
//    });

//    const links = document.createElement("div");
//    links.classList.add("w-full", "flex", "justify-center", "pt-4", "mb-8");
//    links.append(homeLink, forgotPassLink);

//    const formWrapper = document.createElement("div");

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
//       H1("Entrance"),
//       links,
//       Tabs(authTabs, queryKey).target,
//       formWrapper,
//       Footer(true)
//    );

//    const signInForm = SignInForm();
//    const signUpForm = SignUpForm();

//    const handleParamsChange = () => {
//       formWrapper.innerHTML = "";
//       const activeTab = getSearchParam(queryKey);
//       if (activeTab === tabs.signIn) {
//          formWrapper.appendChild(signInForm.target);
//          forgotPassLink.classList.remove("hidden");
//       } else if (activeTab === tabs.signUp) {
//          formWrapper.appendChild(signUpForm.target);
//          forgotPassLink.classList.add("hidden");
//       }
//    };

//    useQueryParamsChange(() => {
//       handleParamsChange();
//    });

//    useNavigationEnter(() => {
//       if (ClientStorage.hasToken()) {
//          navigate(routes.home.pathname)
//       } else {
//          handleParamsChange();
//          signUpForm.reset();
//          signInForm.reset();
//       }
//    });

//    return ContentContainer(wrapper);
// };
