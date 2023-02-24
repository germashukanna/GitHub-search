import React, {useEffect, useState} from "react";
import s from './GitHub.module.css'
import axios from "axios";

type SearchUserType = {
    login: string
    id: number
}
type SearchResult = {
    items: SearchUserType[]
}
type UserType = {
    login: string
    id: number
    avatar_url: string
    followers: number
}

type SearchPropsType = {
    value: string
    onSubmit: (fixedValue: string) => void
}
export const Search: React.FC<SearchPropsType> = (props) => {

    const [tempSearch, setTempSearch] = useState('')

    useEffect(() => {
        setTempSearch(props.value)
    }, [props.value])

    return (
        <div>
            <input placeholder="search" value={tempSearch}
                   onChange={(e) => {
                       setTempSearch(e.currentTarget.value)
                   }}/>
            <button onClick={() => {
                props.onSubmit(tempSearch)
            }}>find
            </button>
        </div>
    )
}

type UsersListPropsType = {
    term: string
    selectedUser: SearchUserType | null
    onUserSelect: (user: SearchUserType) => void
}
export const UsersList: React.FC<UsersListPropsType> = (props) => {
    const [users, setUsers] = useState<SearchUserType[]>([])

    useEffect(() => {
        axios.get<SearchResult>(`https://api.github.com/search/users?q=${props.term}`)
            .then(res => {
                setUsers(res.data.items)
            })
    }, [props.term])

    return (
        <div>
            <ul>
                {users
                    .map(u => <li key={u.id}
                                  className={props.selectedUser === u ? s.selected : ''}
                                  onClick={() => {
                                      props.onUserSelect(u)
                                  }}>{u.login}</li>)
                }
            </ul>
        </div>
    )
}

type TimerPropsType = {
    seconds: number
    onChange: (actualSeconds: number) => void
    timerKey: string
}
export const Timer: React.FC<TimerPropsType> = (props) => {
    const [seconds, setSeconds] = useState(props.seconds)
    useEffect(() => {
        setSeconds(props.seconds)
    }, [props.seconds])

    useEffect(() => {
        props.onChange(seconds)
    }, [seconds])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSeconds((prev) => prev - 1)
        }, 1000)
        return () => {
            clearInterval(intervalId)
        }
    }, [props.timerKey])

    return (
        <div>
            {seconds}
        </div>
    )
}
type UserDetailsPropsType = {
    user: SearchUserType | null
}
export const UserDetails: React.FC<UserDetailsPropsType> = ({user}) => {
    const [userDetails, setUserDetails] = useState<null | UserType>(null)
    const [seconds, setSeconds] = useState<number>(10)

    useEffect(() => {
        if (!!user) {
            axios.get<UserType>(`https://api.github.com/users/${user.login}`)
                .then(res => {
                    setSeconds(10)
                    setUserDetails(res.data)
                })
        }
    }, [user])

    useEffect(() => {
        if (seconds < 1) {
            setUserDetails(null)
        }
    }, [seconds])

    return (
        <div>
            {userDetails && <div>
                <Timer seconds={seconds} onChange={setSeconds} timerKey={userDetails.id.toString()}/>
                <h2>Username</h2>
                <img src={userDetails.avatar_url} alt="ava"/>
                <br/>
                {userDetails.login}, followers: {userDetails.followers}
            </div>}
        </div>
    )
}

export const GitHub = () => {

    const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(null)
    const [searchTerm, setSearchTerm] = useState('it-kamasutra')

    useEffect(() => {
        if (selectedUser) {
            document.title = selectedUser.login
        }
    }, [selectedUser])

    return (
        <div>
            <div>
                <Search value={searchTerm} onSubmit={(value: string) => {
                    setSearchTerm(value)
                }}/>
                <button onClick={() => setSearchTerm('it-kamasutra')}>reset</button>
                <UsersList term={searchTerm} selectedUser={selectedUser} onUserSelect={setSelectedUser}/>
            </div>
            <div>
                <UserDetails user={selectedUser}/>
            </div>
        </div>
    )

}