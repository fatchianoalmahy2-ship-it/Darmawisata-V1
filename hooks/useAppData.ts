'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student, SchoolClass, AppSettings, Bus, Room, AuthUser, RundownItem } from '@/types';
import { AuthService, DEFAULT_PUBLIC_USER } from '@/services/authService';
import { dbService } from '@/services/dbService';
import {
  getInitialStudents,
  getInitialClasses,
  getInitialSettings,
  getInitialRundowns,
} from '@/services/firebaseService';
import { RoomAllocatorEngine } from '@/services/roomAllocator';
import { SeatAllocatorEngine } from '@/services/seatAllocator';
import { normalizeClassName, sortClassesAlphabetically } from '@/lib/utils';
import schoolMetadata from '@/config/schoolMetadata.json';
import schoolClassesData from '@/config/schoolClasses.json';

export const LS_CACHE_KEYS = {
  STUDENTS: 'sim_darmawisata_cache_students',
  CLASSES: 'sim_darmawisata_cache_classes',
  SETTINGS: 'sim_darmawisata_cache_settings',
  RUNDOWNS: 'sim_darmawisata_cache_rundowns',
  LAST_SYNC: 'sim_darmawisata_cache_last_sync',
};

const areStudentsEqual = (a: Student[], b: Student[]) => {
  if (a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

const areClassesEqual = (a: SchoolClass[], b: SchoolClass[]) => {
  if (a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

const areSettingsEqual = (a: AppSettings, b: AppSettings) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const areRundownsEqual = (a: RundownItem[], b: RundownItem[]) => {
  if (a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

export function useAppData() {
  const [currentUser, setCurrentUser] = useState<AuthUser>(DEFAULT_PUBLIC_USER);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    return sortClassesAlphabetically(schoolClassesData as SchoolClass[]);
  });
  const [settings, setSettings] = useState<AppSettings>(schoolMetadata.defaultSettings as AppSettings);
  const [rundowns, setRundowns] = useState<RundownItem[]>(() => {
    return [
      ...(schoolMetadata.rundowns.BALI as RundownItem[]).map((r, idx) => ({ ...r, id: `bali_${idx}` })),
      ...(schoolMetadata.rundowns.YOGYAKARTA as RundownItem[]).map((r, idx) => ({ ...r, id: `yogya_${idx}` })),
    ].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  });
  const [buses, setBuses] = useState<Bus[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(true); // Load instantly!
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');

  const checkIsAngketClosed = useCallback((stgs: AppSettings) => {
    if (stgs.isAngketClosed) return true;
    if (stgs.angketDeadline) {
      const deadline = new Date(stgs.angketDeadline + 'T23:59:59');
      return new Date() > deadline;
    }
    return false;
  }, []);

  const isAngketClosed = checkIsAngketClosed(settings);

  const autoAllocateAllWhenClosed = useCallback((
    currentStudents: Student[],
    currentSettings: AppSettings
  ) => {
    const registeredBali = currentStudents.filter(
      (s) => s.isRegistered && s.destination === 'BALI'
    );
    const baliClasses = Array.from(new Set(registeredBali.map((s) => s.className))).sort();
    const halfCount = Math.ceil(baliClasses.length / 2);
    const gel1Classes = new Set(baliClasses.slice(0, halfCount));

    let updated = currentStudents.map((s) => {
      if (!s.isRegistered) return s;

      let wave = s.wave || 'BALI_GEL_1';
      if (s.destination === 'BALI') {
        wave = gel1Classes.has(s.className) ? 'BALI_GEL_1' : 'BALI_GEL_2';
      } else if (s.destination === 'YOGYAKARTA') {
        wave = 'YOGYA_GEL_1';
      }

      return { ...s, wave };
    });

    const seatRes = SeatAllocatorEngine.autoAllocateBuses(
      updated,
      currentSettings.defaultBusCapacity || 50
    );
    updated = seatRes.updatedStudents;

    const roomRes = RoomAllocatorEngine.autoAllocateRooms(
      updated,
      currentSettings.defaultRoomCapacity || 3
    );
    updated = roomRes.updatedStudents;

    return {
      updatedStudents: updated,
      buses: seatRes.buses,
      rooms: roomRes.rooms,
    };
  }, []);

  useEffect(() => {
    // Step A: Hydrate current auth user
    const savedUser = AuthService.getCurrentUser();
    setCurrentUser(savedUser);

    // Step B: Synchronous LocalStorage Hydration
    try {
      const lsStudents = localStorage.getItem(LS_CACHE_KEYS.STUDENTS);
      const lsClasses = localStorage.getItem(LS_CACHE_KEYS.CLASSES);
      const lsSettings = localStorage.getItem(LS_CACHE_KEYS.SETTINGS);
      const lsRundowns = localStorage.getItem(LS_CACHE_KEYS.RUNDOWNS);

      if (lsStudents || lsClasses || lsSettings) {
        const rawStudents: Student[] = lsStudents ? JSON.parse(lsStudents) : [];
        const parsedStudents = rawStudents.map((s) => ({
          ...s,
          className: normalizeClassName(s.className),
        }));
        const rawClasses: SchoolClass[] = lsClasses ? JSON.parse(lsClasses) : [];
        const parsedClasses = rawClasses.map((c) => ({
          ...c,
          name: normalizeClassName(c.name),
        }));
        const parsedSettings: AppSettings = lsSettings
          ? JSON.parse(lsSettings)
          : (schoolMetadata.defaultSettings as AppSettings);
        const parsedRundowns: RundownItem[] = lsRundowns ? JSON.parse(lsRundowns) : [];

        const finalBuses = SeatAllocatorEngine.deriveBusesFromStudents(
          parsedStudents,
          parsedSettings.defaultBusCapacity
        );
        const finalRooms = RoomAllocatorEngine.deriveRoomsFromStudents(
          parsedStudents,
          parsedSettings.defaultRoomCapacity
        );

        setStudents(parsedStudents);
        setClasses(parsedClasses);
        setSettings(parsedSettings);
        setRundowns(parsedRundowns);
        setBuses(finalBuses);
        setRooms(finalRooms);
        setIsLoaded(true);
      }
    } catch (e: any) {
      console.warn('Fast local storage hydration fallback:', e);
    }

    // Step C: Background sync from IndexedDB & Firebase
    async function backgroundDataSync() {
      setIsSyncing(true);
      try {
        const shouldFetchStudents = true;
        const [rawCachedStudents, rawCachedClasses, cachedSettings, cachedRundowns] = await Promise.all([
          dbService.getAllStudents(),
          dbService.getAllClasses(),
          dbService.getSettings(),
          dbService.getAllRundowns(),
        ]);
        const cachedStudents = rawCachedStudents.map(s => ({...s, className: normalizeClassName(s.className)}));
        const cachedClasses = rawCachedClasses.map(c => ({...c, name: normalizeClassName(c.name)}));

        if (cachedStudents.length > 0 || cachedClasses.length > 0 || cachedSettings) {
          const currentStgs = cachedSettings || (schoolMetadata.defaultSettings as AppSettings);
          const finalBuses = SeatAllocatorEngine.deriveBusesFromStudents(
            cachedStudents,
            currentStgs.defaultBusCapacity
          );
          const finalRooms = RoomAllocatorEngine.deriveRoomsFromStudents(
            cachedStudents,
            currentStgs.defaultRoomCapacity
          );
          setStudents(cachedStudents);
          setClasses(cachedClasses);
          setSettings(currentStgs);
          setRundowns(cachedRundowns);
          setBuses(finalBuses);
          setRooms(finalRooms);
          setIsLoaded(true);

          // Smart TTL check (Solusi 1 & 4): If synced within last 15 minutes, skip expensive collection reads to save quota
          const lastSync = localStorage.getItem(LS_CACHE_KEYS.LAST_SYNC);
          const now = Date.now();
          if (lastSync && now - Number(lastSync) < 15 * 60 * 1000) {
            console.log('Data served from fresh IndexedDB/LocalStorage cache (< 15 mins). Skipping remote fetch to preserve quota.');
            setIsSyncing(false);
            return;
          }
        }

        // Ensure pending background tasks are flushed to Firebase before fetching
        if (!dbService.isSyncing) {
          await dbService.triggerSync();
        }

        // Fetch fresh authoritative data from Firebase
        const [initialStds, initialClss, initialStgs, initialRdns] = await Promise.all([
          shouldFetchStudents ? getInitialStudents() : Promise.resolve([]),
          getInitialClasses(),
          getInitialSettings(),
          getInitialRundowns(),
        ]);

        const isClosed = checkIsAngketClosed(initialStgs);
        const needsAllocation = initialStds.some(
          (s) => s.isRegistered && (!s.busNumber || !s.roomNumber)
        );

        let finalStds = initialStds;
        let finalBuses: Bus[] = [];
        let finalRooms: Room[] = [];

        if (isClosed && needsAllocation) {
          const allocRes = autoAllocateAllWhenClosed(initialStds, initialStgs);
          finalStds = allocRes.updatedStudents;
          finalBuses = allocRes.buses;
          finalRooms = allocRes.rooms;
        } else {
          finalBuses = SeatAllocatorEngine.deriveBusesFromStudents(
            initialStds,
            initialStgs.defaultBusCapacity
          );
          finalRooms = RoomAllocatorEngine.deriveRoomsFromStudents(
            initialStds,
            initialStgs.defaultRoomCapacity
          );
        }

        // Check if there are actual changes before triggering state updates to prevent unneeded re-renders
        const studentsChanged = !areStudentsEqual(cachedStudents, finalStds);
        const classesChanged = !areClassesEqual(cachedClasses, initialClss);
        const settingsChanged = !areSettingsEqual(
          cachedSettings || (schoolMetadata.defaultSettings as AppSettings),
          initialStgs
        );
        const rundownsChanged = !areRundownsEqual(cachedRundowns, initialRdns);

        if (studentsChanged) {
          setStudents(finalStds);
        }
        if (classesChanged) {
          setClasses(initialClss);
        }
        if (settingsChanged) {
          setSettings(initialStgs);
        }
        if (rundownsChanged) {
          setRundowns(initialRdns);
        }
        if (studentsChanged || settingsChanged) {
          setBuses(finalBuses);
          setRooms(finalRooms);
        }

        try {
          localStorage.setItem(LS_CACHE_KEYS.STUDENTS, JSON.stringify(finalStds));
          localStorage.setItem(LS_CACHE_KEYS.CLASSES, JSON.stringify(initialClss));
          localStorage.setItem(LS_CACHE_KEYS.SETTINGS, JSON.stringify(initialStgs));
          localStorage.setItem(LS_CACHE_KEYS.RUNDOWNS, JSON.stringify(initialRdns));
          localStorage.setItem(LS_CACHE_KEYS.LAST_SYNC, String(Date.now()));
        } catch (e) {
          console.warn('LocalStorage caching failed:', e);
        }

        await Promise.all([
          dbService.clearStudents().then(() => dbService.putStudents(finalStds)),
          dbService.clearClasses().then(() => dbService.putClasses(initialClss)),
          dbService.putSettings(initialStgs),
          dbService.clearRundowns().then(() => dbService.putRundowns(initialRdns)),
        ]);
        setIsLoaded(true);
      } catch (err: any) {
        console.error('Background sync failed:', err);
        setLoadError(err.message || 'Error sync data');
        setIsLoaded(true);
      } finally {
        setIsSyncing(false);
      }
    }

    backgroundDataSync();

    if (typeof window !== 'undefined') {
      const handleOnline = () => {
        dbService.triggerSync();
      };
      window.addEventListener('online', handleOnline);
      return () => {
        window.removeEventListener('online', handleOnline);
      };
    }
  }, [autoAllocateAllWhenClosed, checkIsAngketClosed, currentUser.role]);

  // Keep LocalStorage cache in sync with state updates after initial load
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LS_CACHE_KEYS.STUDENTS, JSON.stringify(students));
        localStorage.setItem(LS_CACHE_KEYS.CLASSES, JSON.stringify(classes));
        localStorage.setItem(LS_CACHE_KEYS.SETTINGS, JSON.stringify(settings));
        localStorage.setItem(LS_CACHE_KEYS.RUNDOWNS, JSON.stringify(rundowns));
      } catch (e) {
        console.warn('LocalStorage auto-sync failed:', e);
      }
    }
  }, [isLoaded, students, classes, settings, rundowns]);

  const forceRemoteSync = useCallback(async () => {
    localStorage.removeItem(LS_CACHE_KEYS.LAST_SYNC);
    setIsSyncing(true);
    try {
      const [initialStds, initialClss, initialStgs, initialRdns] = await Promise.all([
        getInitialStudents(),
        getInitialClasses(),
        getInitialSettings(),
        getInitialRundowns(),
      ]);
      setStudents(initialStds);
      setClasses(initialClss);
      setSettings(initialStgs);
      setRundowns(initialRdns);
      localStorage.setItem(LS_CACHE_KEYS.LAST_SYNC, String(Date.now()));
      await dbService.triggerSync();
    } catch (e) {
      console.error('Force remote sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    currentUser,
    setCurrentUser,
    students,
    setStudents,
    classes,
    setClasses,
    settings,
    setSettings,
    rundowns,
    setRundowns,
    buses,
    setBuses,
    rooms,
    setRooms,
    isLoaded,
    isSyncing,
    loadError,
    isAngketClosed,
    checkIsAngketClosed,
    autoAllocateAllWhenClosed,
    forceRemoteSync,
  };
}
