/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
// Models and types
import { Quest, CollectionFormData } from '../../models/Event';
import QuestComponent, { QuestChangeCallback } from './quests';
// Components

import UploadImageButton from '../../components/uploadImageButton';
import CalendarIcon from '../../components/icons/CalendarIcon';

const initialQuest: Quest = {
  // qr_prefix: '',
  // qr_prefix_len: 0,
  reward_description: '',
  reward_title: 'NFT Reward #1',
  reward_uri: '',
};

const initialEventFormState: CollectionFormData = {
  event_name: '',
  event_description: '',
  quests: [initialQuest],
  start_time: new Date().getTime() * 1000000,
  finish_time: (new Date().getTime() + 86400000) * 1000000,
  files: [],
};

interface EventFormProps {
  event_data?: CollectionFormData | null;
  submitForm: (newEvent: CollectionFormData) => void;
  toggle?: (index: number) => void;
}

const EventForm: React.FC<EventFormProps> = ({ submitForm, event_data, toggle }) => {
  const [eventFormState, setEventFormState] = useState<CollectionFormData>(event_data || initialEventFormState);

  const { event_name, event_description, quests, start_time, finish_time, files } = eventFormState;

  // New Event Form Handlers
  const onEventTitleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const eventName = event.currentTarget.value;
    setEventFormState((prevState) => ({ ...prevState, event_name: eventName }));
  };

  const onEventDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const eventDescription = event.currentTarget.value;
    setEventFormState((prevState) => ({ ...prevState, event_description: eventDescription }));
  };

  const onStartTimeChange = (date: Date): void => {
    setEventFormState((prevState) => ({ ...prevState, start_time: date.getTime() * 1000000 }));
  };

  const onFinishTimeChange = (date: Date): void => {
    setEventFormState((prevState) => ({ ...prevState, finish_time: date.getTime() * 1000000 }));
  };

  // Quest/Actions Form Handlers
  const onQuestChange: QuestChangeCallback = (index, field, value): void => {
    setEventFormState((prevState) => ({
      ...prevState,
      quests: prevState.quests.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    }));
  };

  const addNewQuest = (): void => {
    setEventFormState((prevState) => ({
      ...prevState,
      quests: [...prevState.quests, { ...initialQuest, reward_title: `New Quest #${prevState.quests.length + 1}` }],
    }));
  };

  const removeQuest = (index: number): void => {
    setEventFormState((prevState) => ({
      ...prevState,
      quests: prevState.quests.filter((_, i) => i !== index),
    }));
  };

  const setFilesArray = (file: File, index: number) => {
    const newFilesArray = [...files];
    newFilesArray[index] = file;
    setEventFormState((prevState) => ({ ...prevState, files: newFilesArray }));
  };


  // Submitting Form
  const onNewEventSubmit = (event: React.FormEvent): void => {
    event.preventDefault();

    // Setting New Event
    submitForm({
      event_name,
      event_description,
      finish_time,
      start_time,
      quests,
      files,
    });
  };

  return (
    <form
      onSubmit={onNewEventSubmit}
      className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-stretch mb-[40px] w-full max-w-[1240px]"
    >
      <div className="p-5 rounded-xl bg-white relative">
        <h5 className="font-drukMedium uppercase text-black text-xl mb-2" data-testid="event-title">
          New Event
        </h5>
        <div className="justify-center w-full flex mt-2">
          <img className="rounded-t-lg mb-3" src="/pink_circle.png" alt="" style={{ height: 180 }} />
        </div>
        <input
          autoComplete="off"
          type="text"
          name="title"
          onChange={onEventTitleChange}
          value={event_name}
          className="form-control block w-full px-3 py-1.5 text-base font-normal text-black bg-transparent bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 mb-2  focus:border-[#41f092] focus:outline-none"
          placeholder="Event title"
        />
        <textarea
          name="description"
          value={event_description}
          onChange={onEventDescriptionChange}
          className="form-control block w-full mb-2 px-3 py-1.5 text-base font-normal text-black bg-transparent bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0  focus:border-[#41f092] focus:outline-none"
          placeholder="Event description"
        />
        <span className="mb-2 text-black">Start Date:</span>
        <span>
          <label className="flex-row flex justify-between my-2 cursor-pointer">
            <DatePicker
              onChange={onStartTimeChange}
              selected={new Date(start_time / 1000000)}
              dateFormat="dd/MM/yyyy"
              className="w-full px-3 py-1.5 text-base font-normal text-black bg-transparent bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:border-[#41f092] focus:outline-none"
            />
            <CalendarIcon />
          </label>
        </span>
        <span className="mb-4 text-black">End Date:</span>
        <span>
          <label className="flex-row flex justify-between my-2 cursor-pointer align-middle">
            <DatePicker
              onChange={onFinishTimeChange}
              selected={new Date(finish_time / 1000000)}
              dateFormat="dd/MM/yyyy"
              className="w-full px-3 py-1.5 text-base font-normal text-black bg-transparent bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:border-[#41f092] focus:outline-none"
            />
            <CalendarIcon />
          </label>
        </span>
      </div>

      {quests.map((quest, index) => (
        <div key={index} className="flex-col flex mb-4 p-5 rounded-xl bg-white md:mb-0  relative">
          <h5 className="font-drukMedium uppercase text-black text-xl mb-2">NFT Reward</h5>
          <div className="flex flex-col relative">
            <UploadImageButton
              file={files[index]}
              onImageSet={(file: File | null): void => {
                if (file) {
                  setFilesArray(file, index);
                }
              }}
            />
            <QuestComponent
              quest={quest}
              onQuestChange={onQuestChange}
              index={index}
              removable={quests.length >= 2}
              removeQuest={removeQuest}
              setFilesArray={setFilesArray}
            />
          </div>
        </div>
      ))}
      <div className="flex flex-col p-5 rounded-xl bg-white relative justify-center h-full">
        <button
          type="button"
          onClick={addNewQuest}
          className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] outline-none transition duration-150 ease-in-out"
        >
          Add NFT Reward
        </button>
        <button
          type="submit"
          className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] outline-none transition duration-150 ease-in-out"
        >
          Create New Event
        </button>
      </div>
    </form>
  );
};

export default EventForm;
