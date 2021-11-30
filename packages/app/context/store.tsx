import {
  DefaultDualActionWideModalProps,
  DualActionWideModalProps,
} from 'components/Modal/DualActionWideModal';
import { DefaultSingleActionModalProps } from 'components/Modal/SingleActionModal';
import { NotificationProps } from 'components/Notifications/NotificationProps';
import React, { createContext, useReducer } from 'react';
import {
  DefaultDualActionModalProps,
  DualActionModalProps,
} from '../components/Modal/DualActionModal';
import { SingleActionModalProps } from '../components/Modal/SingleActionModal';
import {
  AppActions,
  CLEAR_NOTIFICATIONS,
  DUAL_ACTION_MODAL,
  DUAL_ACTION_WIDE_MODAL,
  HIDE_NOTIFICATION,
  PUSH_NOTIFICATION,
  RESET_WEB3_PROVIDER,
  SET_WEB3_PROVIDER,
  SINGLE_ACTION_MODAL,
  UNSET_NOTIFICATION,
} from './actions';

interface DefaultState {
  notifications: NotificationProps[];
  singleActionModal: SingleActionModalProps;
  dualActionModal: DualActionModalProps;
  dualActionWideModal: DualActionWideModalProps;
  web3Provider: Web3ProviderState;
}

interface Web3ProviderState {
  provider?: any;
  web3Provider?: any;
  address?: string;
  chainId?: number;
  web3Modal?: any;
}

const DefaultWeb3ProviderState: Web3ProviderState = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
};

const initialState: DefaultState = {
  notifications: [],
  singleActionModal: {
    ...DefaultSingleActionModalProps,
  },
  dualActionModal: {
    ...DefaultDualActionModalProps,
  },
  dualActionWideModal: {
    ...DefaultDualActionWideModalProps,
  },
  web3Provider: {
    ...DefaultWeb3ProviderState,
  },
};

const store = createContext(
  initialState as unknown as {
    state: DefaultState;
    dispatch: React.Dispatch<any>;
  },
);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    (state: DefaultState, action: AppActions) => {
      switch (action.type) {
        case PUSH_NOTIFICATION:
          return {
            ...state,
            notifications: [...state.notifications, action.payload],
          };
        case HIDE_NOTIFICATION:
          return {
            ...state,
            notifications: [
              ...state.notifications.map((notification) => {
                if (notification.id == action.payload) {
                  notification.visible = false;
                }
                return notification;
              }),
            ],
          };
        case UNSET_NOTIFICATION:
          return {
            ...state,
            notifications: [
              ...state.notifications.filter(
                (notification) => notification.id !== action.payload,
              ),
            ],
          };
        case CLEAR_NOTIFICATIONS:
          return {
            ...state,
            notifications: [
              ...state.notifications.map((notification) => {
                notification.visible = false;
                return notification;
              }),
            ],
          };
        case SINGLE_ACTION_MODAL:
          return {
            ...state,
            singleActionModal: {
              ...action.payload,
            },
          };
        case DUAL_ACTION_MODAL:
          return {
            ...state,
            dualActionModal: {
              ...action.payload,
            },
          };
        case DUAL_ACTION_WIDE_MODAL:
          return {
            ...state,
            dualActionWideModal: {
              ...action.payload,
            },
          };
        case SET_WEB3_PROVIDER:
          return {
            ...state,
            web3Provider: {
              ...action,
            },
          };
        case RESET_WEB3_PROVIDER:
          return {
            ...state,
            web3Provider: {
              ...DefaultWeb3ProviderState,
            },
          };
        default:
          return {
            ...state,
          };
      }
    },
    initialState,
  );

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
