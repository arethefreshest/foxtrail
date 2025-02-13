import { useEffect } from 'react';
import { Modal } from 'antd';

export const usePreventLeave = (shouldPrevent: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldPrevent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (shouldPrevent) {
        Modal.confirm({
          title: 'Leave Quiz?',
          content: 'Your progress will be lost. Are you sure you want to leave?',
          onOk: () => window.history.go(-1),
          onCancel: () => window.history.pushState(null, '', window.location.href),
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldPrevent]);
}; 