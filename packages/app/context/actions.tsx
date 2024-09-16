import { DualActionModalProps } from 'components/Modal/DualActionModal';
import {
  DefaultDualActionWideModalProps,
  DualActionWideModalProps,
} from 'components/Modal/DualActionWideModal';
import {
  DefaultSingleActionModalProps,
  SingleActionModalProps,
} from 'components/Modal/SingleActionModal';
import { SetWeb3ProviderProps } from 'context/Web3/web3modal';
import { DefaultDualActionModalProps } from '../components/Modal/DualActionModal';
import { NotificationProps } from '../components/Notifications/NotificationProps';

export const PUSH_NOTIFICATION = 'notifications/PUSH_NOTIFICATION';
export const UNSET_NOTIFICATION = 'notifications/UNSET_NOTIFICATION';
export const HIDE_NOTIFICATION = 'notifications/HIDE_NOTIFICATION';
export const CLEAR_NOTIFICATIONS = 'notifications/CLEAR_NOTIFICATIONS';
export const SINGLE_ACTION_MODAL = 'modals/SINGLE_ACTION_MODAL';
export const DUAL_ACTION_MODAL = 'modals/DUAL_ACTION_MODAL';
export const DUAL_ACTION_WIDE_MODAL = 'modals/DUAL_ACTION_WIDE_MODAL';
export const SET_WEB3_PROVIDER = 'modals/SET_WEB3_PROVIDER';
export const RESET_WEB3_PROVIDER = 'modals/RESET_WEB3_PROVIDER';

export type AppActions =
  | PushNotificationAction
  | UnsetNotificationAction
  | HideNotificationAction
  | ClearNotificationsAction
  | SetSingleActionModalAction
  | SetDualActionModalAction
  | SetDualActionWideModalAction
  | SetWeb3ProviderAction
  | ResetWeb3ProviderAction;

export interface ResetWeb3ProviderAction {
  type: typeof RESET_WEB3_PROVIDER;
}
export interface SetWeb3ProviderAction {
  type: typeof SET_WEB3_PROVIDER;
  payload: SetWeb3ProviderProps;
}

export interface PushNotificationAction {
  type: typeof PUSH_NOTIFICATION;
  payload: NotificationProps;
}
export const pushNotification = (
  notification: Partial<Notification>,
): PushNotificationAction => {
  return {
    type: PUSH_NOTIFICATION,
    payload: { ...notification, visible: true } as NotificationProps,
  };
};

export interface UnsetNotificationAction {
  type: typeof UNSET_NOTIFICATION;
  payload: number;
}

export const unsetNotification = (id: number): UnsetNotificationAction => {
  return {
    type: UNSET_NOTIFICATION,
    payload: id,
  };
};

export interface HideNotificationAction {
  type: typeof HIDE_NOTIFICATION;
  payload: number;
}
export const hideNotification = (id: number): HideNotificationAction => {
  return {
    type: HIDE_NOTIFICATION,
    payload: id,
  };
};

export interface ClearNotificationsAction {
  type: typeof CLEAR_NOTIFICATIONS;
}

export const clearNotifications = (): ClearNotificationsAction => {
  return {
    type: CLEAR_NOTIFICATIONS,
  };
};

export interface SetSingleActionModalAction {
  type: typeof SINGLE_ACTION_MODAL;
  payload: SingleActionModalProps;
}

export const setSingleActionModal = (
  props: Partial<SingleActionModalProps> | false,
): SetSingleActionModalAction => {
  if (!props) {
    return {
      type: SINGLE_ACTION_MODAL,
      payload: {
        ...DefaultSingleActionModalProps,
        visible: false,
      },
    };
  }
  return {
    type: SINGLE_ACTION_MODAL,
    payload: {
      ...DefaultSingleActionModalProps,
      visible: true,
      ...props,
    },
  };
};

export interface SetDualActionModalAction {
  type: typeof DUAL_ACTION_MODAL;
  payload: DualActionModalProps;
}
export const setDualActionModal = (
  props: Partial<DualActionModalProps> | false,
): SetDualActionModalAction => {
  if (!props) {
    return {
      type: DUAL_ACTION_MODAL,
      payload: {
        ...DefaultDualActionModalProps,
        visible: false,
      },
    };
  }
  return {
    type: DUAL_ACTION_MODAL,
    payload: {
      ...DefaultDualActionModalProps,
      visible: true,
      ...props,
    },
  };
};

export interface SetDualActionWideModalAction {
  type: typeof DUAL_ACTION_WIDE_MODAL;
  payload: DualActionWideModalProps;
}
export const setDualActionWideModal = (
  props: Partial<DualActionWideModalProps> | false,
): SetDualActionWideModalAction => {
  if (!props) {
    return {
      type: DUAL_ACTION_WIDE_MODAL,
      payload: {
        ...DefaultDualActionWideModalProps,
        visible: false,
      },
    };
  }
  return {
    type: DUAL_ACTION_WIDE_MODAL,
    payload: {
      ...DefaultDualActionWideModalProps,
      visible: true,
      ...props,
    },
  };
};
