#!/usr/bin/env node

import dashboard from './index';

process.title = 'Dashing';

dashboard(process.argv.slice(2));
