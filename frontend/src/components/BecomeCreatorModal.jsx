import { useState } from 'react'
import Modal from './Modal'
import ServiceEditorRow from './ServiceEditorRow'
import { SERVICE_CATEGORIES } from '../data/creators'
import { getCategoryMeta } from '../data/categoryMeta'
import { btn } from './buttonClasses'
import { fieldClass, fieldLabelClass, togglePillClass } from './formClasses'
import { applyAsCreator, createCreatorService } from '../api/creators'
import { ApiError } from '../api/client'
import { formatAvailability } from '../api/adapters'

let serviceIdCounter = 0
function makeEmptyService() {
  serviceIdCounter += 1
  return {
    id: `draft-${serviceIdCounter}`,
    category: SERVICE_CATEGORIES[0].id,
    name: '',
    description: '',
    duration: '',
    price: '',
    meetingRequired: true,
    weekday: 'MON',
    startTime: '18:00',
    endTime: '19:00',
    deliveryTime: '',
  }
}

const emptyProfile = {
  name: '',
  email: '',
  linkedinUrl: '',
  isWorking: true,
  company: '',
  jobTitle: '',
  yearsExperience: '',
  description: '',
}

function BecomeCreatorModal({ onClose, onSubmitApplication }) {
  const [step, setStep] = useState('form') // 'form' | 'preview' | 'confirmation'
  const [profile, setProfile] = useState(emptyProfile)
  const [services, setServices] = useState([makeEmptyService()])
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function updateProfile(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  function updateService(id, updated) {
    setServices((prev) => prev.map((service) => (service.id === id ? updated : service)))
  }

  function removeService(id) {
    setServices((prev) => prev.filter((service) => service.id !== id))
  }

  function addService() {
    setServices((prev) => [...prev, makeEmptyService()])
  }

  function handleContinueToPreview(event) {
    event.preventDefault()
    setStep('preview')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')

    try {
      const { creator, token } = await applyAsCreator(profile)
      for (const service of services) {
        await createCreatorService(creator.id, token, service)
      }
      onSubmitApplication({ profile, services })
      setStep('confirmation')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong submitting your application.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'confirmation') {
    return (
      <Modal title="Application submitted" onClose={onClose}>
        <div className="px-2 pt-3 pb-1 text-center">
          <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-teal-100 text-[1.4rem] text-teal-600">
            ✓
          </div>
          <h3 className="text-[1.05rem]">You're in the queue for verification</h3>
          <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink-600">
            Thanks, {profile.name.split(' ')[0] || 'there'}. Our admin team will review your details
            and services. Your profile will appear on Career Connect only after it's approved —
            we'll reach you at <strong>{profile.email}</strong>.
          </p>
          <button type="button" className={`${btn('navy')} mt-5`} onClick={onClose}>
            Done
          </button>
        </div>
      </Modal>
    )
  }

  if (step === 'preview') {
    return (
      <Modal title="Review your application" onClose={onClose} wide>
        <section>
          <h4 className="mb-2.5 text-[0.9rem] text-ink-600">Profile</h4>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5 max-[560px]:grid-cols-1">
            <div>
              <dt className="text-[0.75rem] text-ink-400">Name</dt>
              <dd className="mt-0.5 text-[0.9rem] text-ink-900">{profile.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] text-ink-400">Status</dt>
              <dd className="mt-0.5 text-[0.9rem] text-ink-900">
                {profile.isWorking ? `${profile.jobTitle} at ${profile.company}` : 'Not currently working'}
              </dd>
            </div>
            <div>
              <dt className="text-[0.75rem] text-ink-400">Email</dt>
              <dd className="mt-0.5 text-[0.9rem] text-ink-900">{profile.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] text-ink-400">LinkedIn</dt>
              <dd className="mt-0.5 text-[0.9rem] text-ink-900">{profile.linkedinUrl || '—'}</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] text-ink-400">Experience</dt>
              <dd className="mt-0.5 text-[0.9rem] text-ink-900">{profile.yearsExperience || '0'} years</dd>
            </div>
          </dl>
          <p className="mt-3.5 text-[0.88rem] leading-relaxed text-ink-600">{profile.description}</p>
        </section>

        <section className="mt-[22px] border-t border-border pt-5">
          <h4 className="mb-2.5 text-[0.9rem] text-ink-600">Services ({services.length})</h4>
          <div className="flex flex-col gap-2.5">
            {services.map((service) => {
              const meta = getCategoryMeta(service.category)
              return (
                <div
                  key={service.id}
                  className="flex flex-col gap-0.5 rounded-lg border-l-4 bg-bg px-3.5 py-2.5 text-[0.87rem]"
                  style={{ borderLeftColor: meta.color }}
                >
                  <span className="text-[0.72rem] font-semibold" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <strong>{service.name || 'Untitled service'}</strong>
                  <span>
                    ₹{service.price || 0} · {service.duration || 'n/a'}
                  </span>
                  <span className="text-ink-600">
                    {service.meetingRequired
                      ? formatAvailability([
                          { weekday: service.weekday, start_time: service.startTime, end_time: service.endTime },
                        ])
                      : service.deliveryTime}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <label className="mt-[22px] flex items-start gap-2.5 text-[0.85rem] leading-relaxed text-ink-600">
          <input
            type="checkbox"
            className="mt-[3px]"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I confirm this information is accurate and I agree to Career Connect's marketplace rules,
            including that a referral is a submission attempt, not a guaranteed outcome.
          </span>
        </label>

        {submitError && (
          <p className="mt-[18px] rounded-lg bg-danger-100 px-3.5 py-2.5 text-[0.85rem] text-danger-600">
            {submitError}
          </p>
        )}

        <div className="mt-[22px] flex justify-end gap-2.5">
          <button type="button" className={btn('outline')} onClick={() => setStep('form')} disabled={submitting}>
            Back to edit
          </button>
          <button type="button" className={btn('gold')} disabled={!agreed || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting…' : 'Submit for verification'}
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Become a creator" onClose={onClose} wide>
      <form onSubmit={handleContinueToPreview}>
        <section>
          <h4 className="text-[0.95rem] text-ink-600">Your profile</h4>
          <div className="mt-3.5 grid grid-cols-2 gap-3.5 max-[560px]:grid-cols-1">
            <label className={fieldClass()}>
              <span className={fieldLabelClass}>Full name</span>
              <input
                className={fieldClass('control')}
                type="text"
                required
                value={profile.name}
                onChange={(event) => updateProfile('name', event.target.value)}
              />
            </label>

            <label className={fieldClass()}>
              <span className={fieldLabelClass}>Email</span>
              <input
                className={fieldClass('control')}
                type="email"
                required
                value={profile.email}
                onChange={(event) => updateProfile('email', event.target.value)}
              />
            </label>

            <label className={fieldClass()}>
              <span className={fieldLabelClass}>LinkedIn URL</span>
              <input
                className={fieldClass('control')}
                type="url"
                required
                placeholder="https://linkedin.com/in/..."
                value={profile.linkedinUrl}
                onChange={(event) => updateProfile('linkedinUrl', event.target.value)}
              />
            </label>

            <label className={fieldClass()}>
              <span className={fieldLabelClass}>Years of experience</span>
              <input
                className={fieldClass('control')}
                type="number"
                min="0"
                required
                value={profile.yearsExperience}
                onChange={(event) => updateProfile('yearsExperience', event.target.value)}
              />
            </label>

            <fieldset className={`${fieldClass('full')} m-0 border-0 p-0`}>
              <legend className={fieldLabelClass}>Current status</legend>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={togglePillClass(profile.isWorking)}
                  onClick={() => updateProfile('isWorking', true)}
                >
                  Currently working
                </button>
                <button
                  type="button"
                  className={togglePillClass(!profile.isWorking)}
                  onClick={() => updateProfile('isWorking', false)}
                >
                  Not currently working
                </button>
              </div>
            </fieldset>

            {profile.isWorking && (
              <>
                <label className={fieldClass()}>
                  <span className={fieldLabelClass}>Company</span>
                  <input
                    className={fieldClass('control')}
                    type="text"
                    required
                    value={profile.company}
                    onChange={(event) => updateProfile('company', event.target.value)}
                  />
                </label>
                <label className={fieldClass()}>
                  <span className={fieldLabelClass}>Job title</span>
                  <input
                    className={fieldClass('control')}
                    type="text"
                    required
                    value={profile.jobTitle}
                    onChange={(event) => updateProfile('jobTitle', event.target.value)}
                  />
                </label>
              </>
            )}

            <label className={fieldClass('full')}>
              <span className={fieldLabelClass}>Short description</span>
              <textarea
                className={fieldClass('control')}
                rows={3}
                required
                placeholder="What do you help candidates with?"
                value={profile.description}
                onChange={(event) => updateProfile('description', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="mt-7 border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[0.95rem] text-ink-600">Services</h4>
            <button type="button" className={btn('outline', 'small')} onClick={addService}>
              Add another service
            </button>
          </div>
          <div className="mt-3.5 flex flex-col gap-3.5">
            {services.map((service, index) => (
              <ServiceEditorRow
                key={service.id}
                service={service}
                index={index}
                onChange={updateService}
                onRemove={removeService}
                canRemove={services.length > 1}
              />
            ))}
          </div>
        </section>

        <div className="mt-7 flex justify-end gap-2.5 border-t border-border pt-5">
          <button type="button" className={btn('outline')} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={btn('navy')}>
            Preview application
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BecomeCreatorModal
