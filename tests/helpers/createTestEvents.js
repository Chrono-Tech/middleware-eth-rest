/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 */

const moment = require('moment');

module.exports = async (testEvent) => {
      const tx = await new testEvent({controlIndexHash: 644, 
        created: moment().add(-20, 'hours').toISOString()}).save();
      await new testEvent({controlIndexHash: 645, 
        created: moment().add(-20, 'hours').toISOString()}).save();
      await new testEvent({controlIndexHash: 646}).save();
      await new testEvent({controlIndexHash: 647}).save();
      await new testEvent({controlIndexHash: 648}).save();
      await new testEvent({controlIndexHash: 649}).save();
      await new testEvent({controlIndexHash: 650}).save();
}