import { useState, useCallback } from 'react';
import { API_BASE } from '../lib/api';
import { getToken } from '../lib/storage';

export const useCollaboration = () => {
    const [loading, setLoading] = useState(false);

    const sendInvitations = useCallback(async (taskId, collaboratorIds) => {
        setLoading(true);
        try {
            const { access } = await getToken();

            const response = await fetch(`${API_BASE}/api/collaboration-invitations/send-invitation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({
                    task_id: taskId,
                    collaborator_ids: collaboratorIds
                })
            });

            if (!response.ok) throw new Error('Ошибка отправки приглашений');

            return await response.json();
        } finally {
            setLoading(false);
        }
    }, []);

    const respondToInvitation = useCallback(async (invitationId, accept) => {
        setLoading(true);
        try {
            const { access } = await getToken();

            const response = await fetch(
                `${API_BASE}/api/collaboration-invitations/${invitationId}/respond-invitation/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access}`
                    },
                    body: JSON.stringify({ accept })
                }
            );

            if (!response.ok) throw new Error('Ошибка ответа на приглашение');

            return await response.json();
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        sendInvitations,
        respondToInvitation
    };
};