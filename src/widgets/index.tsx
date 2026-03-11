import {
  declareIndexPlugin,
  type ReactRNPlugin,
  WidgetLocation,
} from '@remnote/plugin-sdk';
import '../style.css';
import '../index.css';

const POWERUP_CODE = 'strudel';

async function onActivate(plugin: ReactRNPlugin) {
  // Register the Strudel powerup (no properties needed -- the Rem text
  // itself holds the strudel code).
  await plugin.app.registerPowerup(
    'Strudel',
    POWERUP_CODE,
    'Tag a Rem to render its text as a Strudel.cc live coding pattern',
    {
      slots: [],
    },
  );

  // Widget that renders the REPL below tagged Rem.
  await plugin.app.registerWidget('strudel_widget', WidgetLocation.UnderRemEditor, {
    dimensions: { height: 'auto', width: '100%' },
    powerupFilter: POWERUP_CODE,
  });

  // Command: tag the focused Rem with the Strudel powerup.
  await plugin.app.registerCommand({
    id: 'strudel-embed',
    name: 'Strudel: Embed REPL',
    description: 'Embed a Strudel.cc REPL under the focused Rem (the Rem text is the code)',
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      if (!rem) {
        await plugin.app.toast('Focus on a Rem first.');
        return;
      }

      const hasPowerup = await rem.hasPowerup(POWERUP_CODE);
      if (hasPowerup) {
        await plugin.app.toast('This Rem already has a Strudel REPL.');
        return;
      }

      await rem.addPowerup(POWERUP_CODE);
      await plugin.app.toast('Strudel REPL embedded! Edit the Rem text to change the pattern.');
    },
  });

  // Command: remove the Strudel powerup from the focused Rem.
  await plugin.app.registerCommand({
    id: 'strudel-remove',
    name: 'Strudel: Remove REPL',
    description: 'Remove the Strudel REPL from the focused Rem',
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      if (!rem) {
        await plugin.app.toast('Focus on a Rem first.');
        return;
      }

      const hasPowerup = await rem.hasPowerup(POWERUP_CODE);
      if (!hasPowerup) {
        await plugin.app.toast('This Rem does not have a Strudel REPL.');
        return;
      }

      await rem.removePowerup(POWERUP_CODE);
      await plugin.app.toast('Strudel REPL removed.');
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
