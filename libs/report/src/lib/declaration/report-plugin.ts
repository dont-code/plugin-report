import { Plugin, DontCodeModel, PluginConfig, Core } from '@dontcode/core';

/**
 * This plugin demonstrate 2 things:
 * - how to declare a new field type that can be selected in the Builder and how to manage the display and edition of this new type in the Previewer.
 * - As well it adds a new attribute 'seed' to any Entity and provides a viewer for the Previewer when its value is Yes or Maybe.
 */
export class ReportPlugin implements Plugin {
  getConfiguration(): PluginConfig {
    return {
      plugin: {
        id: 'ReportPlugin',
        'display-name':
          'Implements the Dont-code standard report model.',
        version: '1.0.0',
      },
      'preview-handlers': [
        {
          location: {
            parent: DontCodeModel.APP_REPORTS,
            id: ''
          },
          class: {
            name: 'ReportEntityComponent',
            source: 'report',
          },
        },
        {
          location: {
            parent: DontCodeModel.APP_REPORTS_DISPLAY,
            id: ''
          },
          class: {
            name: 'ReportDisplayComponent',
            source: 'report',
          },
        },
      ],
    };
  }

  pluginInit(dontCode: Core): void {
    // Nothing to do here
  }
}
