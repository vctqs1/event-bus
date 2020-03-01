import { EventBus } from './event-bus';

//------------------------------------------------------------------------------------
// register
//------------------------------------------------------------------------------------

describe('[EventBus]: register', () => {
  it('should register schemas on new channels', () => {
    const eventBus = new EventBus();
    let exists = eventBus.register('test1', { type: 'boolean' });
    expect(exists).toBeFalsy();
    exists = eventBus.register('test2', { type: 'string' });
    expect(exists).toBeFalsy();
  });

  it('should reregister an equal schema on an existing channel', () => {
    const eventBus = new EventBus();
    let exists = eventBus.register('test1', { type: 'object', properties: { test: { type: 'boolean' } } });
    expect(exists).toBeFalsy();
    exists = eventBus.register('test1', { properties: { test: { type: 'boolean' } }, type: 'object' });
    expect(exists).toBeTruthy();
  });

  it('should be fail to register a differentiating schema on an existing channel', () => {
    const eventBus = new EventBus();
    const register = () => {
      eventBus.register('test1', { type: 'boolean' });
      eventBus.register('test1', { type: 'string' });
    };
    expect(register).toThrowError();
  });
});

//------------------------------------------------------------------------------------
// unregister
//------------------------------------------------------------------------------------

describe('[EventBus]: unregister', () => {
  it('should unregister the schema from channel', () => {
    const eventBus = new EventBus();
    let exists = eventBus.unregister('test1');
    expect(exists).toBeFalsy();
    eventBus.register('test1', { type: 'boolean' });
    exists = eventBus.unregister('test1');
    expect(exists).toBeTruthy();
  });
});

//------------------------------------------------------------------------------------
// subscribe
//------------------------------------------------------------------------------------

describe('[EventBus]: subscribe', () => {
  it('should subscribe to a new channel', () => {
    const eventBus = new EventBus();
    eventBus.subscribe('test1', jest.fn());
  });

  it('should subscribe to an existing channel with replay of last event', () => {
    const eventBus = new EventBus();
    eventBus.subscribe('test1', true, replay => {
      expect(replay).toBeFalsy();
    });
  });

  it('should not trigger a callback if no replay is requested', () => {
    const eventBus = new EventBus();
    const callback = jest.fn();
    eventBus.subscribe('test1', false, callback);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should unsubscribe to an existing channel', () => {
    const eventBus = new EventBus();
    const subscription = eventBus.subscribe('test1', jest.fn());
    subscription.unsubscribe();
  });
});

//------------------------------------------------------------------------------------
// publish
//------------------------------------------------------------------------------------

describe('[EventBus]: publish', () => {
  it('should publish event to a new channel', () => {
    const eventBus = new EventBus();
    eventBus.publish('test1', true);
  });

  it('should publish event to a registered channel matching schema', () => {
    const eventBus = new EventBus();
    eventBus.register('test1', { type: 'boolean' });
    eventBus.publish('test1', true);
  });

  it('should fail to publish incorrect event to a registered channel with schema', () => {
    const eventBus = new EventBus();
    const publish = () => {
      eventBus.register('test1', { type: 'boolean' });
      eventBus.publish('test1', 'hello');
    };
    expect(publish).toThrowError();
  });
});

//------------------------------------------------------------------------------------
// subscribe and publish
//------------------------------------------------------------------------------------

describe('[EventBus]: subscribe and publish', () => {
  it('should receive same data as published', done => {
    const eventBus = new EventBus();
    const sent = { test1: true };
    eventBus.subscribe('test1', received => {
      expect(received).toEqual(sent);
      done();
    });
    eventBus.publish('test1', sent);
  });

  it('should handle multiple subscriptions with correct channels', () => {
    const eventBus = new EventBus();
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    eventBus.subscribe('test1', callback1);
    eventBus.subscribe('test1', callback2);
    eventBus.subscribe('test2', callback3);
    eventBus.publish('test1', { test1: true });
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });

  it('should no longer receive data after unsubscription', () => {
    const eventBus = new EventBus();
    const callback = jest.fn();
    const subscription = eventBus.subscribe('test1', callback);
    eventBus.publish('test1', { test1: true });
    expect(callback).toHaveBeenCalled();
    subscription.unsubscribe();
    eventBus.publish('test1', { test1: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
