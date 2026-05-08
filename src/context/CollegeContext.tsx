import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAllColleges } from '../lib/college';
import { CollegeData } from '../types/tc';

interface CollegeContextType {
  colleges: CollegeData[];
  selected: CollegeData | null;
  setSelected: (c: CollegeData | null) => void;
  reload: () => void;
}

const CollegeContext = createContext<CollegeContextType>({
  colleges: [], selected: null, setSelected: () => {}, reload: () => {},
});

export const useCollege = (): CollegeContextType => useContext(CollegeContext);

export const CollegeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [selected, setSelected] = useState<CollegeData | null>(null);

  const reload = (): void => {
    getAllColleges().then(list => {
      setColleges(list);
      setSelected(prev => {
        if (prev) return list.find(c => c.id === prev.id) ?? list[0] ?? null;
        return list[0] ?? null;
      });
    }).catch(() => {});
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, []);

  return (
    <CollegeContext.Provider value={{ colleges, selected, setSelected, reload }}>
      {children}
    </CollegeContext.Provider>
  );
};
