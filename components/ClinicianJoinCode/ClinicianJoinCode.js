import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSession } from 'next-auth/client';
import { Button, Icon, Alert } from 'rsuite';
import { mutate } from 'swr';

import styles from './ClinicianJoinCode.module.css';

import useSWR from '../../lib/swr';
import { Roles } from '../../lib/constants';

const getCode = id => {
  const { data, error } = useSWR('/api/departments/' + id, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return data;
};

function ClinicianJoinCode() {
  const [session] = useSession();
  const code = getCode(session.user.departmentId);

  const regenerateInDatabase = async id => {
    const res = await fetch(
      '/api/join_codes/' + Roles.USER_TYPE_DEPARTMENT + '/' + id,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return await res.json();
  };

  const regenerateCode = async id => {
    await regenerateInDatabase(id);
    mutate('/api/departments/' + id);
    Alert.success('Join URL updated', 3000);
  };

  const showCopyAlert = () => {
    Alert.info('Copied', 3000);
  };

  return (
    <div className={styles.content}>
      <div style={{ width: '70%' }}>
        {'Please send this unique URL to clinicians so they can join your ' +
          (code !== undefined ? code['0']['name'] : 'loading...') +
          ' department:'}{' '}
        {`https://${window.location.host}/join/${Roles.USER_TYPE_CLINICIAN}/${
          code !== undefined
            ? code['0']['clinician_join_codes']['code']
            : 'loading...'
        }`}
      </div>

      <CopyToClipboard
        text={`https://${window.location.host}/join/${
          Roles.USER_TYPE_CLINICIAN
        }/${
          code !== undefined
            ? code['0']['clinician_join_codes']['code']
            : 'loading...'
        }`}>
        <Button appearance="primary" onClick={() => showCopyAlert()}>
          <Icon icon="clone" /> Copy to clipboard
        </Button>
      </CopyToClipboard>

      <Button
        appearance="primary"
        onClick={() => regenerateCode(session.user.departmentId)}>
        <div>Re-generate URL</div>
      </Button>
    </div>
  );
}
export default ClinicianJoinCode;
