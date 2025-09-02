import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export const getIncidents = async (childId, startDate = null, endDate = null) => {
  try {
    let q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      orderBy('timestamp', 'desc')
    );
    if (startDate) q = query(q, where('timestamp', '>=', startDate));
    if (endDate) q = query(q, where('timestamp', '<=', endDate));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

