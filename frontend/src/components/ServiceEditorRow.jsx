import { SERVICE_CATEGORIES } from '../data/creators'
import { fieldClass, fieldLabelClass, togglePillClass } from './formClasses'

const WEEKDAYS = [
  { id: 'MON', label: 'Monday' },
  { id: 'TUE', label: 'Tuesday' },
  { id: 'WED', label: 'Wednesday' },
  { id: 'THU', label: 'Thursday' },
  { id: 'FRI', label: 'Friday' },
  { id: 'SAT', label: 'Saturday' },
  { id: 'SUN', label: 'Sunday' },
]

function ServiceEditorRow({ service, index, onChange, onRemove, canRemove }) {
  function update(field, value) {
    onChange(service.id, { ...service, [field]: value })
  }

  return (
    <div className="rounded-2xl border border-border bg-bg p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-display text-[0.85rem] font-semibold text-navy-800">
          Service {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(service.id)}
            className="rounded p-1 text-[0.8rem] font-medium text-danger-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
        <label className={fieldClass()}>
          <span className={fieldLabelClass}>Category</span>
          <select
            className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-[0.9rem] text-ink-900 focus-visible:outline-2 focus-visible:outline-navy-700"
            value={service.category}
            onChange={(event) => update('category', event.target.value)}
          >
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldClass()}>
          <span className={fieldLabelClass}>Service name</span>
          <input
            className={fieldClass('control')}
            type="text"
            required
            value={service.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="e.g. 30-min Career Consultation"
          />
        </label>

        <label className={fieldClass('full')}>
          <span className={fieldLabelClass}>Description</span>
          <textarea
            className={fieldClass('control')}
            rows={2}
            required
            value={service.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="What does a candidate get from this service?"
          />
        </label>

        <label className={fieldClass()}>
          <span className={fieldLabelClass}>Duration</span>
          <input
            className={fieldClass('control')}
            type="text"
            value={service.duration}
            onChange={(event) => update('duration', event.target.value)}
            placeholder="e.g. 30 min, or n/a"
          />
        </label>

        <label className={fieldClass()}>
          <span className={fieldLabelClass}>Price (₹)</span>
          <input
            className={fieldClass('control')}
            type="number"
            min="0"
            required
            value={service.price}
            onChange={(event) => update('price', event.target.value)}
            placeholder="499"
          />
        </label>

        <fieldset className={`${fieldClass('full')} m-0 border-0 p-0`}>
          <legend className={fieldLabelClass}>Requires a meeting?</legend>
          <div className="flex gap-2">
            <button
              type="button"
              className={togglePillClass(service.meetingRequired)}
              onClick={() => update('meetingRequired', true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={togglePillClass(!service.meetingRequired)}
              onClick={() => update('meetingRequired', false)}
            >
              No
            </button>
          </div>
        </fieldset>

        {service.meetingRequired ? (
          <div className={`${fieldClass('full')} grid grid-cols-3 gap-3 max-[460px]:grid-cols-1`}>
            <label className={fieldClass()}>
              <span className={fieldLabelClass}>Day</span>
              <select
                className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-[0.9rem] text-ink-900 focus-visible:outline-2 focus-visible:outline-navy-700"
                value={service.weekday}
                onChange={(event) => update('weekday', event.target.value)}
              >
                {WEEKDAYS.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldClass()}>
              <span className={fieldLabelClass}>From</span>
              <input
                className={fieldClass('control')}
                type="time"
                required
                value={service.startTime}
                onChange={(event) => update('startTime', event.target.value)}
              />
            </label>
            <label className={fieldClass()}>
              <span className={fieldLabelClass}>Until</span>
              <input
                className={fieldClass('control')}
                type="time"
                required
                value={service.endTime}
                onChange={(event) => update('endTime', event.target.value)}
              />
            </label>
          </div>
        ) : (
          <label className={fieldClass('full')}>
            <span className={fieldLabelClass}>Expected delivery time</span>
            <input
              className={fieldClass('control')}
              type="text"
              required
              value={service.deliveryTime}
              onChange={(event) => update('deliveryTime', event.target.value)}
              placeholder="e.g. Delivered within 48 hours"
            />
          </label>
        )}
      </div>
    </div>
  )
}

export default ServiceEditorRow
