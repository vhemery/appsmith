import {
  SocialLoginButtonProps as CE_SocialLoginButtonProps,
  SocialLoginButtonPropsList as CE_SocialLoginButtonPropsList,
} from "ce/constants/SocialLogin";
import { KeycloakOAuthURL } from "./ApiConstants";
import KeyLogo from "assets/icons/ads/key-2-line.svg";

export type SocialLoginButtonProps = CE_SocialLoginButtonProps;
export const KeycloakSocialLoginButtonProps: SocialLoginButtonProps = {
  url: KeycloakOAuthURL,
  name: "Keycloak",
  logo: KeyLogo,
  label: "Sign In with SSO",
};

export const SocialLoginButtonPropsList: Record<
  string,
  SocialLoginButtonProps
> = {
  ...CE_SocialLoginButtonPropsList,
  keycloak: KeycloakSocialLoginButtonProps,
};

export type SocialLoginType = keyof typeof SocialLoginButtonPropsList;

export const getSocialLoginButtonProps = (
  logins: SocialLoginType[],
): SocialLoginButtonProps[] => {
  return logins.map((login) => {
    const socialLoginButtonProps = SocialLoginButtonPropsList[login];
    if (!socialLoginButtonProps) {
      throw Error("Social login not registered: " + login);
    }
    return socialLoginButtonProps;
  });
};
