'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function MailSettingsPage() {
    const [profileImg, setProfileImg] = useState('/images/faces/pharmacy_profile.png');

    useEffect(() => {
        // Initialize Choices.js if available in window
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (typeof window !== 'undefined' && win.Choices) {
            const Choices = win.Choices;
            new Choices('#language', {
                allowHTML: true,
                removeItemButton: true,
            });
            new Choices('#mail-language', {
                allowHTML: true,
                removeItemButton: true,
            });
        }
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setProfileImg(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                e.target.value = '';
                alert('Please select a valid image');
            }
        }
    };

    return (
        <>
            <Header />
            <Sidebar />

            <div className="main-content app-content">
                <div className="container-fluid">

                    {/* Start::page-header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
                        <h1 className="page-title fw-semibold fs-18 mb-0">Mail Settings</h1>
                        <div className="ms-md-1 ms-0">
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><Link href="/">Mail</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Mail Settings</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* End::page-header */}

                    <div className="row">
                        <div className="col-xl-9">
                            <div className="card custom-card">
                                <div className="card-header justify-content-between">
                                    <div className="card-title">
                                        Personal Information
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row gy-3">
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-first-name" className="form-label">First Name :</label>
                                            <input type="text" className="form-control" id="mail-first-name" defaultValue="Naveen" placeholder="Enter Name" />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-last-name" className="form-label">Last Name :</label>
                                            <input type="text" className="form-control" id="mail-last-name" defaultValue="Sapam" placeholder="Enter Name" />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-email-address" className="form-label">Email Address :</label>
                                            <input type="text" className="form-control" id="mail-email-address" defaultValue="naveensapam@gmail.com" placeholder="Enter Email" />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-contact-no" className="form-label">Contact Number :</label>
                                            <input type="text" className="form-control" id="mail-contact-no" defaultValue="+1(555) 555-1234" placeholder="Enter Number" />
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="mail-description" className="form-label">Bio :</label>
                                            <textarea className="form-control" id="mail-description" rows={3} defaultValue="I am a professional web designer with 5 years of experience in creating beautiful and functional websites. I specialize in HTML, CSS, and JavaScript, and I have a keen eye for detail. In my free time, I enjoy reading, hiking, and spending time with my family."></textarea>
                                        </div>
                                        <div className="col-xl-6">
                                            <label className="form-label">Gender :</label>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="gender" id="gender-male" defaultChecked />
                                                    <label className="form-check-label" htmlFor="gender-male">
                                                        Male
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="gender" id="gender-female" />
                                                    <label className="form-check-label" htmlFor="gender-female">
                                                        Female
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="language" className="form-label">Language :</label>
                                            <select className="form-control" name="language" id="language" multiple defaultValue={['English']}>
                                                <option value="English">English</option>
                                                <option value="French">French</option>
                                                <option value="Arabic">Arabic</option>
                                                <option value="Hindi">Hindi</option>
                                            </select>
                                        </div>
                                        <div className="col-xl-12">
                                            <div className="d-flex align-items-start gap-4">
                                                <div className="mb-0">
                                                    <label htmlFor="profile-change" className="form-label">Update Profile :</label>
                                                    <input type="file" className="form-control" id="profile-change" onChange={handleProfileChange} />
                                                </div>
                                                <div className="mt-4">
                                                    <Image src={profileImg} alt="Profile" width={80} height={80} className="avatar avatar-xxl rounded-circle" id="profile-img" unoptimized />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="float-end">
                                        <button className="btn btn-primary-light m-1">Cancel</button>
                                        <button className="btn btn-primary m-1">Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3">
                            <div className="card custom-card">
                                <div className="card-header">
                                    <div className="card-title">
                                        Security Settings
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row gy-3">
                                        <div className="col-xl-12">
                                            <label className="form-label">Two Factor Authentication</label>
                                            <div className="form-check form-switch p-0">
                                                <input className="form-check-input float-end" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
                                                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Enable 2FA</label>
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <label className="form-label">Login History</label>
                                            <div className="d-grid">
                                                <button className="btn btn-outline-info">View History</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
