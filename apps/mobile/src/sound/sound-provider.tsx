import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const SOUND_ENABLED_KEY = "vocora.soundEffectsEnabled";

// Tiny synthesized tones keep feedback instant and available offline without
// interrupting music or ignoring the phone's silent-mode preference.
const SUCCESS_TONE = "data:audio/wav;base64,UklGRuQDAABXQVZFZm10IBAAAAABAAEAcBcAAHAXAAABAAgAZGF0YcADAACAgIGCgoGAfnx7fH+ChYeHhYF8eHV2eoCHjI6LhX11cHB0fIaPk5KMgnZtaWx1go6XmpSJem1kZGx7i5mfnZKBb2JdY3GEl6OlnIt2ZVtcaHqPn6ailIBsXlphcYaYpKWbinVkW1xpfJCgpqGTf2teWmJyh5mkpZqIdGNaXWp9kaCmoJF9al1aY3SImqWkmYdyYlpea3+ToaagkHxpXVtkdYqbpaSYhnFhWl5sgJSipp+Pe2hcW2V2i5ylpJeEcGBaX22BlaKmno55Z1xbZniMnaajloNvYFpgb4OWo6adjHhmW1xneY6epqKVgW1fWmBwhJejpZyLdmVbXGh6j5+mopSAbF5aYXGFmKSlm4p1ZFtcaXyQoKahk39rXlpicoeZpKWaiHRjWl1qfZGgpqCRfWpdWmN0iJqlpJmHcmJaXmt/k6GmoJB8aV1bZHWKm6WkmIZxYVpebICUoqafj3toXFtldoucpaSXhHBgWl9tgZWipp6OeWdcW2Z4jJ2mo5aDb2BaYG+DlqOmnYx4ZltcZ3mNnqailYFtX1pgcISXo6Wci3ZlW1xoeo+fpqKUgGxeWmFxhZikpZuKdWRbXGl8kKCNc19aZ36XpaKQdmFaZXyVpKOSeWNaY3mSo6SUe2RaYXaQoqWWfmZaYHSOoaWZgGhbXnGLoKabg2pbXW+Jnqachm1cXG2GnaaeiG9dW2qDm6agi3FeW2iBmaWhjXRgWmZ+l6WikHZhWmR7lKSjknljWmN5kqOklXxlWmF2kKKll35mWmB0jaGlmYFoW15xi6Cmm4NrW11viJ6mnYZtXFxshpymnolvXVtqg5qmoItyXltogJiloY50YFpmfpalopB3YVpke5Sko5N5Y1pieJKjpJV8ZVphdpCipZd+Z1pfc42hppmBaVtecYufppuEa1xdb4idpZyGbl1dbYWbpJ2JcGBea4KYo52Lc2JeaoCWoZ2MdmRfaX6Tn52OeGZgaXyQnZ2Pe2liaHqOm5yQfWtjaHiLmZyRf21kaHeJl5uSgXBmaHWHlZqSg3JoaXSFk5mThHRqaXODkZeThnZranOBj5aTh3hta3KAjZSSiHpvbHJ+i5OSiXxxbXJ9ipGRiX1zbnJ8iJCQiX50cHN7ho6PioB2cXN7hYyOioF4c3R6g4uNiYF5dHV6gomMiYJ7dnV6gYiLiIN8d3Z6gYaJiIN9eHh7gIWIh4N+enl7f4SGhoN/e3p8f4OFhYN/fHt8f4KEhIKAfX19f4GDg4KAfn5+f4GBgoGAf39/gICAgIA=";
const ERROR_TONE = "data:audio/wav;base64,UklGRmwDAABXQVZFZm10IBAAAAABAAEAcBcAAHAXAAABAAgAZGF0YUgDAACAgICBgoKDhISEhISDgoB/fXt5d3Z1dHV1d3l7foGFiIuOkZKTk5KQjYmFgHt2cW1pZ2ZmZ2ltcnd+hIuRl5yfoqKhnpqVjoZ+dm5nYl1bWlteYmhvdn6Hj5acoaSmpqSgm5WNhX11bWdhXVtaW15iaG93f4ePlpyhpKampKCblY2FfXVtZ2FdW1pbXmJob3Z/h4+WnKGkpqakoJuVjoZ+dm5nYl5bWltdYWdudX2FjZWboKSmpqShnZeQiIB4cGljXltaWl1gZWxze4OLk5mfo6WmpaKemZKKgnpya2VgXFpaXF9jaXB4gIiQl52hpKampKCblY6GfnZuaGJeW1pbXWFmbXR8hIyTmp+jpaalop6YkoqCenJrZWBcWlpbXmNpcHd/h4+WnKGkpqakoZyWj4iAeHBpY19cWlpcYGVrcnmBiZGYnaKlpqakoJuVjoZ+dm9oYl5bWltdYGZsc3uDi5KZnqKlpqWjn5qUjYV9dW5nYl5bWltdYWZsc3uDi5KZnqKlpqWjn5qUjYV9dW5oYl5bWltdYGVsc3qCipGYnqKlpqakoJuVjoZ+d29pY15bWlpcYGRqcXmBiJCXnKGkpqakoZyXkIiAeXFqZGBcWlpbXmNob3Z+ho6Vm6Cjpaalop6ZkouEfHRtZ2FdW1pbXWFmbHN7goqRmJ2ipaampKCclo+IgHhxamRfXFpaXF5jaG92foaNlJqfo6WmpaOfmpOMhX11bmhiXltaWlxgZGpxeICIj5acoKSmpqShnZiRioN7dG1oY19dXF1fY2dtc3qBiI+Vmp2goaGgnZmUj4iCe3VvamZjYWFhY2ZrcHV7gYeNkpaanJ2dnJmWko2Hgnx3cm1qZ2ZlZmdqbXJ2e4GGi4+TlpiZmZiWk5CMh4J+eXVxbmtqaWprbXBzd3t/hIiMj5GTlJSUkpCOioeDf3t4dXJwb25ub3BydXh7foKFiIuNj5CQkI+NjImHhIF+e3h2dHNycnNzdXd5e32AgoWHiYqLi4yLiomIhoSCgH58enl4d3d3d3h5enx9f4GChIWGh4eHh4eGhYSDgoF/fn19fHt7e3t8fH19fn+AgIGCgoKDg4ODgoKCgYGAgICAf39/f3+AgIA=";
const COMPLETE_TONE = "data:audio/wav;base64,UklGRjwGAABXQVZFZm10IBAAAAABAAEAcBcAAHAXAAABAAgAZGF0YRgGAACAgIGBgYB+fX1+gIGCgoKCgYB/fXx8fYCDhYWEgoB+fHp5en2CiY6OiX5ya2t1hJGYlYp7cGxweYKIiYiGhYSCf3l0cnZ9h46Rjod/eHNwcHR9iZWbmIt3ZVxidIudo5uJdWhnb3uFiomGhIWGhYB5cm9zfIiRlJCIfnVvbXB3go6Ym5WGcmNdZnmPn6GXhHJoanN/h4mGg4OFiIeCeHBscXyKlJeSh3txbGxxeoaSmZmRgW9iYGt+k5+ekoBwaW13gYeHg4GDh4uKgndtanB9jZiakoV3bWlsdH+LlJmWjHxsYmNwg5Sem418b2tweoKGhIGAhIqNi4F0aWdvf5CbnJKCc2lnbXeDj5aYk4d4amRndIaVnJeKe3BudHyChIF/gIaNkIx/cWZlcYOVn52Qfm5mZm98iJKWlY6DdWpma3iIlJmTh3pycXZ9gYF+foGJkJKLfGxjZXOHmqKcjHlqY2dzgIyUlZKKf3RraW97iZOWkIV6dHR4fX9+fH6DjJOTiXhoYGV2jJ6jm4h0ZmJpd4WPlJOOhnxzbm1yfYiRk46FfHZ2eXx8fHt/h5CVkoZ0ZF9ne5KipJiDb2NjbXyJkpOQioN7dHBwdH2HjpGNhX55d3h5enp8gYqTlpCBb2Ffa4CXpKOTfWphZHGAjZKRjYaAe3ZzcnV8hYyPjYeAend2d3d5fYWOlpaNfGpeYG+Gm6agj3hnYWd2hY+Sj4mEf3x5dXR1e4OLj46Jgnt2dHR1eYCJkpeViXdmXmJ0jJ+mnYlzZGJreoiQkIuGgoB+e3d0dHmBi5CRi4N6dHFxdXuDjZWYkoRyY15mepGhpJiEb2Nkb3+LkI2Ig4GBgH14c3J3gYuSk42DeHFub3V9h5GXl45/bmJga3+VoqGUf2xkZ3SCjI6KhYKCg4N/eHFwdYGNlZaOgnVta293gYyUmJSKemthY3CEl6Gej3trZWt4hYyMh4KBg4aFf3ZubXSCkJmYjoByaWlveoaQlpeRhXZpYmd1iJmgmop4a2hve4aLiYSBgoaJh35za2t0hJScmY18bWZncX6Kk5eVjYBzaGVreouZnZWGdmtrc32GiIaCgYSJi4d9cGhqdoiYn5qLeGljaHSCj5aXkoh8cGhob32NmJqSg3VtbnV/hYaDgYKHjI2GeWxlaXiMnKGZh3NlYWl4h5KXlY6EeW9qa3OAjZaWjoJ2cHF3foODgYGEio6NhHZoY2p8kaCil4JuYWFsfYyVl5KKgHdwbW93goyTk4yBd3JzeH2AgYCCh42QjIFxZWJtgZajopN9aV9icIKQl5aPhX12cXByeYKLkZGLgnl0dHd7fn+BhIqQkYp9bWJjcIabpaCOd2VeZXWGk5eTi4J7dnRzdXqBiY+Qi4R7dnR2eXx+goiOkpGHeGlgZXWMn6adiXJhXmh6i5WWkId/end2dnZ5f4eNj42GfXZzc3Z6f4WLkZOPg3NlYGh6kaKlmYNtYGBtf46VlIyDfXp6eXh3eH2FjZCPh352cXF0eoGIj5OTjH5vY2FsgJWjo5R+aV9jcYOQlZCIgHx8fHt5dnZ7hI2SkYl+dG5uc3uEjJKVkYh5a2JkcYWZo6CPeWdgZ3aHkZONhX99fn99eHR0eoSPlZOKfXFrbHJ9iJCVlY6DdWhjZ3aKm6KcinVmYmt6iZGQiYJ+f4GBfndxcXmFkpiViXptZ2p0gIyUlpOLfnFnZGx7jpygl4VyZmVvfoqPjYaAf4GEg311b3F6h5SZlId3a2dsd4SOlJSPhXpwamtygI6XmJCBc2xtdYCIi4iDgIGDhYJ8dHBzfImTlpCEdmxqcHuHj5KPiYF5cm9xeIKMkZGKf3Zxc3mBhoeFgoGChIWBe3Vydn6JkZKMgXVvb3V/iI2OioV+eXZ1d3yDiYyLhn95dnh8gYOEgoGBg4SDgHt2dXmBiY6Nh352c3R6gYeKiYaBfnt5ent/goWHhoN/fHt7foCBgoGBgoODgn98eXp9goaJh4N+eXh6foKFhoSCgH59fX1+gIGCg4KBgH5+fn+AgIGBgYGBgYF/fn1+f4GCg4KBf35+f4CBgYGBgICAgICAgIA=";

export type SoundEffect = "success" | "error" | "complete";

type SoundContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  play: (effect: SoundEffect) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const success = useAudioPlayer(SUCCESS_TONE);
  const error = useAudioPlayer(ERROR_TONE);
  const complete = useAudioPlayer(COMPLETE_TONE);

  useEffect(() => {
    void AsyncStorage.getItem(SOUND_ENABLED_KEY).then((stored) => setEnabledState(stored !== "0"));
    void setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: "mixWithOthers",
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    success.volume = 0.28;
    error.volume = 0.22;
    complete.volume = 0.3;
  }, [complete, error, success]);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    void AsyncStorage.setItem(SOUND_ENABLED_KEY, next ? "1" : "0");
  }, []);

  const play = useCallback((effect: SoundEffect) => {
    if (!enabled) return;
    const player = effect === "success" ? success : effect === "error" ? error : complete;
    void player.seekTo(0).then(() => player.play()).catch(() => undefined);
  }, [complete, enabled, error, success]);

  const value = useMemo(() => ({ enabled, setEnabled, play }), [enabled, play, setEnabled]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSoundEffects() {
  const value = useContext(SoundContext);
  if (!value) throw new Error("useSoundEffects must be used inside SoundProvider");
  return value;
}
