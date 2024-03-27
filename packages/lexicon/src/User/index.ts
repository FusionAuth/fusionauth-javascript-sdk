import { Brand } from 'src/Tools';
import { GUID } from 'src/GUID';

export type User = {
  applicationId: ApplicationId;
  birthdate: Date;
  email: Email;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  roles: string[];
  scope: string;
  sid: SId;
  sub: Sub;
  tid: TId;
};

export type ApplicationId = Brand<GUID, 'ApplicationId'>;
export type SId = Brand<GUID, 'SId'>;
export type Sub = Brand<GUID, 'Sub'>;
export type TId = Brand<GUID, 'TId'>;
export type Email = Brand<string, 'Email'>;

// const exampleUser: User = {
//   applicationId: GUID.from("e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"),
//   birthdate: new Date("1985-11-23"),
//   email: "richard@example.com" as Email,
//   email_verified: true,
//   family_name: "Hendricks",
//   given_name: "Richard",
//   roles: [],
//   scope: "openid offline_access",
//   sid: GUID.from("689a2b62-d7e1-480b-bc25-c7fc8f0f3418"),
//   sub: GUID.from("00000000-0000-0000-0000-111111111111"),
//   tid: GUID.from("d7d09513-a3f5-401c-9685-34ab6c552453"),
// }
