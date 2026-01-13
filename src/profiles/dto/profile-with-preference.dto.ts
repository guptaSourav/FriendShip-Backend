import { Profile } from '../entities/profile.schema';
import { Preference } from '../entities/preference.schema';

export type ProfileWithPreference = Profile & {
  preference?: Preference | null;
};
