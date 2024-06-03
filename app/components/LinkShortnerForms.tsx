'use client'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
} from '@chakra-ui/react'
import { ChangeEventHandler, useState } from 'react'
import { DTOILink } from '../types/ILink'

export default function LinkShortnerForms() {
  const [link, setLink] = useState<DTOILink>({
    slug: '',
    redirectTo: '',
    userId: 'ee52889d-1693-4310-9a60-bd7188edb136',
  })
  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/links', {
        body: JSON.stringify(link),
        method: 'POST',
      })
      const json = await res.json()
      console.log(json)
    } catch (error) {
      console.log(error)
    }
  }
  const handleLinkChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setLink({ ...link, [e.target.name]: e.target.value })
    console.log(link)
  }
  const slugHasError = link?.slug === ''
  const redirectToHasError = link?.redirectTo === ''
  return (
    <FormControl className="flex flex-col max-w-96">
      <Box className="flex items-center">
        <Text fontSize="2xl">fewl.ink/</Text>
        <Input
          isInvalid={slugHasError}
          className="ml-2"
          type="text"
          value={link?.slug}
          onChange={handleLinkChange}
          id="slug"
          name="slug"
        />
      </Box>
      <FormLabel className="mt-4" htmlFor="redirectTo">
        Redirecionar para:
      </FormLabel>
      <Input
        isInvalid={redirectToHasError}
        type="url"
        value={link?.redirectTo}
        onChange={handleLinkChange}
        id="redirectTo"
        name="redirectTo"
      />
      <Button onClick={handleSubmit} className="mt-6" type="submit">
        Criar Link
      </Button>
    </FormControl>
  )
}
